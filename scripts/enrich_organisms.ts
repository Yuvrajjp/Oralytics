import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Enriching organisms with detailed data from seeded/organisms.json...');

    // Read organisms
    const organismsPath = path.join(process.cwd(), 'data/seeded/organisms.json');
    const organismsJson = JSON.parse(fs.readFileSync(organismsPath, 'utf-8'));

    let updated = 0;
    let enrichments = [];

    for (const orgJson of organismsJson.organisms) {
      // Match by scientific name
      const existing = await prisma.organism.findFirst({
        where: {
          OR: [
            { scientificName: { contains: orgJson.name.split(' ')[0], mode: 'insensitive' } },
            { commonName: { contains: orgJson.aliases?.[0] || '', mode: 'insensitive' } },
          ],
        },
        include: { profile: true },
      });

      if (existing && existing.profile) {
        // Update profile with detailed GC content and ecology
        const updated_profile = await prisma.organismProfile.update({
          where: { id: existing.profile.id },
          data: {
            gcContent: orgJson.gcContent || existing.profile.gcContent,
            genomeDescription: orgJson.description,
            cellShape: orgJson.taxonomy?.class || existing.profile.cellShape,
          },
        });

        // Log the enrichment in history
        const historyEntry = await prisma.profileHistory.create({
          data: {
            profileId: existing.profile.id,
            organismId: existing.id,
            versionNumber: updated_profile.versionNumber + 1,
            changeField: 'detailed_enrichment',
            previousValue: `GC: ${existing.profile.gcContent}%`,
            newValue: `GC: ${orgJson.gcContent}%`,
            changeReason: 'Enriched with detailed seeded organism data',
            dataSource: 'Seeded JSON',
            changedBy: 'system:script:enrich_organisms',
            notes: `Updated from seeded/organisms.json for ${orgJson.name}`,
          },
        });

        enrichments.push({
          name: orgJson.name,
          gcContent: orgJson.gcContent,
          profileId: existing.profile.id,
        });
        updated++;
      }
    }

    console.log(`\n✓ Enriched ${updated} organism profiles:`);
    for (const e of enrichments) {
      console.log(`  - ${e.name}: GC=${e.gcContent}%`);
    }

    // Show summary
    console.log(`\nDatabase Summary:`);
    const orgCount = await prisma.organism.count();
    const profileCount = await prisma.organismProfile.count();
    const historyCount = await prisma.profileHistory.count();
    console.log(`  Organisms: ${orgCount}`);
    console.log(`  Profiles: ${profileCount}`);
    console.log(`  History entries: ${historyCount}`);

  } catch (error) {
    console.error('Error during enrichment:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
