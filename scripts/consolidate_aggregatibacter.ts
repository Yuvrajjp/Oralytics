import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Scanning for Aggregatibacter records...\n');

  // Find all Aggregatibacter variants
  const organisms = await prisma.organism.findMany({
    where: {
      OR: [
        { scientificName: { contains: 'Aggregatibacter', mode: 'insensitive' } },
        { commonName: { contains: 'Aggregatibacter', mode: 'insensitive' } },
        { commonName: { contains: 'A. actinomycetemcomitans', mode: 'insensitive' } },
      ],
    },
    include: {
      profile: true,
      chromosomes: true,
      genes: { select: { id: true, symbol: true } },
    },
  });

  console.log(`Found ${organisms.length} Aggregatibacter record(s):\n`);
  organisms.forEach((org, idx) => {
    console.log(`${idx + 1}. ID: ${org.id}`);
    console.log(`   Scientific: ${org.scientificName}`);
    console.log(`   Common: ${org.commonName}`);
    console.log(`   Taxonomy ID: ${org.taxonomyId}`);
    console.log(`   Chromosomes: ${org.chromosomes.length}`);
    console.log(`   Genes: ${org.genes.length}`);
    console.log(`   Profile: ${org.profile ? 'Yes' : 'No'}`);
    if (org.profile) {
      console.log(`     - NCBI Accession: ${org.profile.ncbiGenomeAccession || 'None'}`);
      console.log(`     - Genome Size: ${org.profile.genomeSize || 'Unknown'}`);
      console.log(`     - Estimated Genes: ${org.profile.estimatedGenes || 'Unknown'}`);
      console.log(`     - Estimated Proteins: ${org.profile.estimatedProteins || 'Unknown'}`);
    }
    console.log('');
  });

  if (organisms.length === 0) {
    console.log('❌ No Aggregatibacter records found!');
    process.exit(1);
  }

  // Identify canonical record (most complete)
  let canonical = organisms[0];
  let maxCompleteness = 0;

  organisms.forEach((org) => {
    let score = 0;
    if (org.profile) score += 5;
    if (org.profile?.ncbiGenomeAccession) score += 3;
    if (org.chromosomes.length > 0) score += 2;
    if (org.genes.length > 0) score += 2;
    if (org.taxonomyId) score += 1;

    console.log(`  ${org.scientificName}: completeness score = ${score}`);

    if (score > maxCompleteness) {
      maxCompleteness = score;
      canonical = org;
    }
  });

  console.log(`\n✅ Selected canonical record: ${canonical.scientificName} (ID: ${canonical.id})`);
  console.log(`   Completeness score: ${maxCompleteness}\n`);

  // If multiple records, consolidate
  if (organisms.length > 1) {
    console.log('📦 Consolidating records...\n');

    const otherOrganisms = organisms.filter((o) => o.id !== canonical.id);

    for (const other of otherOrganisms) {
      console.log(`  Merging ${other.scientificName} (${other.id})...`);

      // Reassign genes to canonical
      await prisma.gene.updateMany({
        where: { organismId: other.id },
        data: { organismId: canonical.id },
      });

      // Reassign chromosomes to canonical
      await prisma.chromosome.updateMany({
        where: { organismId: other.id },
        data: { organismId: canonical.id },
      });

      // Reassign profile to canonical
      if (other.profile && !canonical.profile) {
        await prisma.organismProfile.update({
          where: { id: other.profile.id },
          data: { organism: { connect: { id: canonical.id } } },
        });
      }

      // Delete the redundant organism
      await prisma.organism.delete({ where: { id: other.id } });
      console.log(`    ✓ Deleted\n`);
    }

    console.log('✅ Consolidation complete!\n');
  }

  // Ensure canonical has a profile
  let profile = canonical.profile;
  if (!profile) {
    console.log('📊 Creating organism profile...\n');
    profile = await prisma.organismProfile.create({
      data: {
        organism: { connect: { id: canonical.id } },
        versionNumber: 1,
      },
    });
    console.log(`✓ Profile created (ID: ${profile.id})\n`);
  }

  console.log('📝 Profile data:\n');
  console.log(`  ID: ${profile.id}`);
  console.log(`  Version: ${profile.versionNumber}`);
  console.log(`  NCBI Accession: ${profile.ncbiGenomeAccession || '[Empty]'}`);
  console.log(`  Genome Size: ${profile.genomeSize || '[Empty]'}`);
  console.log(`  GC Content: ${profile.gcContent || '[Empty]'}`);
  console.log(`  Estimated Genes: ${profile.estimatedGenes || '[Empty]'}`);
  console.log(`  Estimated Proteins: ${profile.estimatedProteins || '[Empty]'}`);
  console.log('');

  console.log('Consolidated and ready for enrichment.\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
