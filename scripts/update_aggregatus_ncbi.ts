import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Identify Actinomyces aggregatus by scientificName or commonName
  const organism = await prisma.organism.findFirst({
    where: {
      OR: [
        { scientificName: 'Actinomyces aggregatus' },
        { commonName: 'A. aggregatus' },
      ],
    },
  });

  if (!organism) {
    console.error('Actinomyces aggregatus not found in organisms table.');
    process.exit(1);
  }

  const ncbiAccession = 'GCF_000429225.1';
  const ncbiDownloadUrl = 'https://api.ncbi.nlm.nih.gov/datasets/v2/genome/accession/GCF_000429225.1/download?include_annotation_type=GENOME_FASTA&include_annotation_type=GENOME_GFF&include_annotation_type=RNA_FASTA&include_annotation_type=CDS_FASTA&include_annotation_type=PROT_FASTA&include_annotation_type=SEQUENCE_REPORT&hydrated=FULLY_HYDRATED';
  const ncbiTaxonomyUrl = 'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=1120941';
  const ncbiTaxId = 1120941;

  const profile = await prisma.organismProfile.upsert({
    where: { organismId: organism.id },
    create: {
      organismId: organism.id,
      versionNumber: 1,
      ncbiTaxonId: ncbiTaxId,
      ncbiGenomeAccession: ncbiAccession,
      ncbiGenomeDownloadUrl: ncbiDownloadUrl,
      ncbiTaxonomyUrl: ncbiTaxonomyUrl,
      homdUrl: organism.description?.includes('homd.org') ? undefined : undefined,
    },
    update: {
      versionNumber: { increment: 1 } as any,
      ncbiTaxonId: ncbiTaxId,
      ncbiGenomeAccession: ncbiAccession,
      ncbiGenomeDownloadUrl: ncbiDownloadUrl,
      ncbiTaxonomyUrl: ncbiTaxonomyUrl,
    },
  });

  // Create a history entry describing the change
  await prisma.profileHistory.create({
    data: {
      profileId: profile.id,
      organismId: organism.id,
      versionNumber: profile.versionNumber,
      changeField: 'ncbi_integration',
      previousValue: null,
      newValue: `accession=${ncbiAccession}`,
      changeReason: 'Added NCBI genome accession and URLs provided by user',
      dataSource: 'NCBI Datasets',
      changedBy: 'system:script:update_aggregatus_ncbi',
      notes: `Added genome download URL and taxonomy URL: ${ncbiDownloadUrl} | ${ncbiTaxonomyUrl}`,
    },
  });

  console.log('Updated profile for Actinomyces aggregatus:', profile.id);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });