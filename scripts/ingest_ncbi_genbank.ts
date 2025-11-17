import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

interface Gene {
  locus_tag: string;
  product: string;
  coordinates: string;
  protein_id: string;
  start?: number;
  end?: number;
  strand?: string;
}

/**
 * Parse GenBank file to extract genes
 */
async function parseGenBank(filePath: string): Promise<{
  organism: string;
  accession: string;
  description: string;
  genes: Gene[];
}> {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');

  let organism = '';
  let accession = '';
  let description = '';
  let inFeatures = false;
  let currentFeature: any = null;
  const genes: Gene[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Extract metadata from header
    if (line.startsWith('LOCUS')) {
      const parts = line.split(/\s+/);
      accession = parts[1];
    }

    if (line.startsWith('DEFINITION')) {
      description = line.substring(12).trim();
      // Continue reading multi-line definition
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith('            ')) {
        description += ' ' + lines[j].substring(12).trim();
        j++;
      }
    }

    if (line.startsWith('ORGANISM')) {
      organism = line.substring(12).trim();
    }

    // Parse features
    if (line.startsWith('FEATURES')) {
      inFeatures = true;
      continue;
    }

    if (inFeatures && (line.startsWith('ORIGIN') || line.startsWith('//'))) {
      // Save last feature
      if (currentFeature?.product && currentFeature?.protein_id) {
        genes.push(currentFeature);
      }
      break;
    }

    if (inFeatures) {
      // New feature starts
      if (line.match(/^\s{5}(CDS|gene)\s+/)) {
        if (currentFeature?.product && currentFeature?.protein_id) {
          genes.push(currentFeature);
        }

        currentFeature = {
          locus_tag: '',
          gene: '',
          product: '',
          coordinates: '',
          protein_id: '',
          start: 0,
          end: 0,
          strand: '+',
        };

        // Parse coordinates
        const coordMatch = line.match(/(?:CDS|gene)\s+([<>0-9.]+)/);
        if (coordMatch) {
          currentFeature.coordinates = coordMatch[1];
          // Try to parse start and end
          const rangeMatch = coordMatch[1].match(/(?:<)?(\d+)\.\.(?:>)?(\d+)/);
          if (rangeMatch) {
            currentFeature.start = parseInt(rangeMatch[1]);
            currentFeature.end = parseInt(rangeMatch[2]);
          }
          // Detect strand
          if (coordMatch[1].includes('complement')) {
            currentFeature.strand = '-';
          }
        }
      }

      // Extract qualifiers for current feature
      if (currentFeature) {
        if (line.includes('/locus_tag="')) {
          currentFeature.locus_tag =
            line.match(/\/locus_tag="([^"]+)"/)?.[1] || '';
        }
        if (line.includes('/gene="')) {
          currentFeature.gene = line.match(/\/gene="([^"]+)"/)?.[1] || '';
        }
        if (line.includes('/product="')) {
          currentFeature.product = line.match(/\/product="([^"]+)"/)?.[1] || '';
        }
        if (line.includes('/protein_id="')) {
          currentFeature.protein_id =
            line.match(/\/protein_id="([^"]+)"/)?.[1] || '';
        }
      }
    }
  }

  return { organism, accession, description, genes };
}

/**
 * Parse proteins from FASTA file
 */
async function parseProteinFasta(filePath: string): Promise<
  Map<
    string,
    {
      sequence: string;
      length: number;
    }
  >
> {
  const content = await fs.readFile(filePath, 'utf-8');
  const entries = new Map();

  let currentId = '';
  let currentSeq = '';

  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('>')) {
      if (currentId && currentSeq) {
        entries.set(currentId, { sequence: currentSeq, length: currentSeq.length });
      }
      // Extract protein ID from header
      const match = line.match(/\[protein_id=([^\]]+)\]/) || line.match(/^>(\S+)/);
      currentId = match?.[1] || line.substring(1);
      currentSeq = '';
    } else {
      currentSeq += line.trim();
    }
  }

  if (currentId && currentSeq) {
    entries.set(currentId, { sequence: currentSeq, length: currentSeq.length });
  }

  return entries;
}

/**
 * Get or create organism
 */
async function getOrCreateOrganism(name: string, accession: string) {
  // Check if this is Aggregatibacter actinomycetemcomitans
  let organism = await prisma.organism.findFirst({
    where: {
      scientificName: {
        contains: 'Aggregatibacter',
      },
    },
  });

  if (!organism) {
    // Create new organism for this strain
    organism = await prisma.organism.create({
      data: {
        scientificName: 'Aggregatibacter actinomycetemcomitans',
        commonName: 'Aggregatibacter',
        taxonomyId: 714962,
        description:
          'Gram-negative coccobacillus, oral pathogen associated with aggressive periodontitis',
      },
    });
  }

  return organism;
}

/**
 * Main ingestion function
 */
async function ingestNCBIGenBank() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      NCBI GenBank Data Ingestion into Database             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Parse GenBank file
    console.log('📖 Parsing GenBank file...');
    const gbPath = path.join(
      process.cwd(),
      'data',
      'genbank',
      'CP076449.gb'
    );
    const genBankData = await parseGenBank(gbPath);
    console.log(`   ✓ Organism: ${genBankData.organism}`);
    console.log(`   ✓ Accession: ${genBankData.accession}`);
    console.log(`   ✓ Genes found: ${genBankData.genes.length}`);

    // Parse protein sequences
    console.log('\n🧬 Parsing protein sequences...');
    const protPath = path.join(
      process.cwd(),
      'data',
      'proteins',
      'CP076449_proteins.fasta'
    );
    const proteins = await parseProteinFasta(protPath);
    console.log(`   ✓ Proteins found: ${proteins.size}`);

    // Get or create organism
    console.log('\n🔍 Looking up organism in database...');
    const organism = await getOrCreateOrganism(
      genBankData.organism,
      genBankData.accession
    );
    console.log(`   ✓ Organism ID: ${organism.id}`);
    console.log(`   ✓ Name: ${organism.scientificName || organism.commonName}`);

    // Check if chromosome already exists
    console.log('\n🗂️  Checking for existing chromosome...');
    let chromosome = await prisma.chromosome.findFirst({
      where: {
        accession: genBankData.accession,
        organismId: organism.id,
      },
    });

    if (chromosome) {
      console.log(`   ⚠️  Chromosome ${genBankData.accession} already exists`);
      console.log(`   Would delete and recreate with fresh data...`);
      // Use existing chromosome and proceed to attempt linking genes/proteins
      // (we avoid deleting to preserve existing data)
    }

    // Create chromosome
    console.log('\n📝 Creating chromosome record...');
    if (!chromosome) {
      chromosome = await prisma.chromosome.create({
        data: {
          organism: {
            connect: { id: organism.id },
          },
          name: genBankData.accession,
          accession: genBankData.accession,
          description: genBankData.description,
          sequenceLength: 2331529, // From downloaded FASTA
          gcContent: 56.5, // Will calculate from actual sequence if needed
        },
      });
    }
    console.log(`   ✓ Chromosome created: ${chromosome.id}`);
    console.log(`   ✓ Accession: ${chromosome.name}`);

    // Create genes and proteins
    console.log(
      '\n⚙️  Ingesting genes and proteins (this may take a moment)...'
    );
    let genesCreated = 0;
    let proteinsCreated = 0;
    let skipped = 0;

    for (const gene of genBankData.genes) {
      try {
        // Look up protein data if available
        const proteinData = gene.protein_id ? proteins.get(gene.protein_id) : null;

        // Create or update gene
        const geneRecord = await prisma.gene.upsert({
          where: {
            chromosomeId_locus_tag: {
              chromosomeId: chromosome.id,
              locus_tag: gene.locus_tag,
            },
          },
          update: {
            description: gene.product,
            startPosition: gene.start || 0,
            endPosition: gene.end || 0,
            strand: gene.strand || '+',
          },
          create: {
            chromosome: {
              connect: { id: chromosome.id },
            },
            organism: { connect: { id: organism.id } },
            locus_tag: gene.locus_tag,
            description: gene.product,
            symbol: gene.locus_tag || gene.protein_id || (gene.product || '').slice(0, 50),
            name: gene.product || gene.locus_tag || '',
            startPosition: gene.start || 0,
            endPosition: gene.end || 0,
            strand: gene.strand || '+',
            // sequenceLength not stored on Gene model; coordinates preserved in parsing
          },
        });

        genesCreated++;

        // Create protein if available
        if (gene.protein_id && proteinData) {
          try {
            const proteinRecord = await prisma.protein.upsert({
              where: {
                accession: gene.protein_id,
              },
              update: {
                gene: {
                  connect: { id: geneRecord.id },
                },
              },
              create: {
                gene: {
                  connect: { id: geneRecord.id },
                },
                accession: gene.protein_id,
                name: gene.product,
                sequenceLength: proteinData.length,
              },
            });
            proteinsCreated++;
          } catch (e) {
            // Protein might already be linked to another gene
          }
        }
      } catch (e) {
        skipped++;
        // Log error details for first few problematic records to diagnose
        if (skipped <= 10) {
          console.error('   ❌ Error creating/upserting gene for', gene?.locus_tag || gene?.product || '(unknown)', e);
        }
        if (skipped % 100 === 0) {
          console.log(`   ⚠️  Skipped ${skipped} problematic records`);
        }
      }
    }

    console.log(`   ✓ Genes created: ${genesCreated}`);
    console.log(`   ✓ Proteins linked: ${proteinsCreated}`);
    if (skipped > 0) {
      console.log(`   ⚠️  Records skipped: ${skipped}`);
    }

    // Update organism profile with NCBI data
    console.log('\n📊 Updating organism profile...');
    let profile = await prisma.organismProfile.findUnique({
      where: { organismId: organism.id },
    });

    if (!profile) {
      profile = await prisma.organismProfile.create({
        data: {
          organism: { connect: { id: organism.id } },
          genomeSize: 2331529,
          gcContent: 56.5,
          estimatedGenes: genesCreated,
          estimatedProteins: proteinsCreated,
          genomeDescription: `Complete genome of ${genBankData.organism} (${genBankData.accession})`,
          ncbiGenomeAccession: genBankData.accession,
          ncbiGenomeDownloadUrl: `https://www.ncbi.nlm.nih.gov/nuccore/${genBankData.accession}`,
          ncbiTaxonomyUrl: `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${organism.taxonomyId}`,
        },
      });

      // Create history entry
      await prisma.profileHistory.create({
        data: {
          profileId: profile.id,
          organismId: organism.id,
          versionNumber: 1,
          dataSource: 'NCBI BioProject PRJNA735719 - GenBank Ingestion',
          changeReason: `Initial ingestion of ${genesCreated} genes and ${proteinsCreated} proteins from GenBank`,
          notes: `Chromosome accession: ${genBankData.accession}`,
        },
      });

      console.log(`   ✓ Profile created`);
    } else {
      // Update existing profile
      await prisma.organismProfile.update({
        where: { id: profile.id },
        data: {
          estimatedGenes: genesCreated,
          estimatedProteins: proteinsCreated,
          genomeDescription: `Complete genome of ${genBankData.organism} (${genBankData.accession})`,
          ncbiGenomeAccession: genBankData.accession,
          ncbiGenomeDownloadUrl: `https://www.ncbi.nlm.nih.gov/nuccore/${genBankData.accession}`,
          ncbiTaxonomyUrl: `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${organism.taxonomyId}`,
        },
      });

      console.log(`   ✓ Profile updated`);
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                  INGESTION COMPLETE                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n✅ Successfully ingested NCBI genomic data:`);
    console.log(`   • Chromosome: ${genBankData.accession}`);
    console.log(`   • Organism: ${organism.scientificName || organism.commonName}`);
    console.log(`   • Genes: ${genesCreated}`);
    console.log(`   • Proteins: ${proteinsCreated}`);
    console.log(`   • Length: 2,331,529 bp`);
    console.log(`   • GC Content: 56.5%\n`);
  } catch (error) {
    console.error('❌ Error during ingestion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run
ingestNCBIGenBank().catch(console.error);
