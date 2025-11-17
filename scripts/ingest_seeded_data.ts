import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting data ingestion from /data/seeded/...');

    // Read datasets
    const datasetsPath = path.join(process.cwd(), 'data/seeded/datasets.json');
    const datasetsJson = JSON.parse(fs.readFileSync(datasetsPath, 'utf-8'));
    console.log(`Loaded ${datasetsJson.datasets.length} datasets`);

    // Read organisms
    const organismsPath = path.join(process.cwd(), 'data/seeded/organisms.json');
    const organismsJson = JSON.parse(fs.readFileSync(organismsPath, 'utf-8'));
    console.log(`Loaded ${organismsJson.organisms.length} organisms from JSON`);

    // The organisms in the JSON are more detailed; for now, log them
    // In a real scenario, we'd map these to the existing Prisma schema
    for (const org of organismsJson.organisms.slice(0, 3)) {
      console.log(`  - ${org.name}: ${org.genomeSizeMb} Mb, GC content: ${org.gcContent}%`);
      console.log(`    Genes: ${org.genes.length}, Articles: ${org.linkedArticles.length}`);
    }

    // Count current organisms in the database
    const currentOrgCount = await prisma.organism.count();
    console.log(`\nCurrent organisms in database: ${currentOrgCount}`);

    // Count current profiles
    const currentProfileCount = await prisma.organismProfile.count();
    console.log(`Current profiles in database: ${currentProfileCount}`);

    // Suggest next steps
    console.log('\n✓ Data files loaded and validated');
    console.log('Next steps:');
    console.log('  1. Map detailed JSON gene/article data to Prisma models');
    console.log('  2. Create enrich script to update organism records with detailed GC content');
    console.log('  3. Ingest datasets table (if needed in schema)');
    console.log('  4. Import omics.csv for multi-omic profiling');

  } catch (error) {
    console.error('Error during ingestion:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
