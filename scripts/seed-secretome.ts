// scripts/seed-secretome.ts
// Seed script for populating secretome data (starting with leukotoxin system)

import { PrismaClient } from '@prisma/client';
import path from 'path';
import {
  getLeukotoxinSystem,
  loadSecretionSystemSequences,
  parseFastaFile,
  parseProteinHeader,
  classifySecretionPathway
} from '../lib/secretome-parser';

const prisma = new PrismaClient();

async function main() {
  console.log('🔬 Starting secretome data seeding...');
  
  // 1. Find or create the A. actinomycetemcomitans organism
  let organism = await prisma.organism.findFirst({
    where: {
      scientificName: {
        contains: 'Aggregatibacter actinomycetemcomitans'
      }
    }
  });
  
  if (!organism) {
    console.log('Creating A. actinomycetemcomitans organism...');
    organism = await prisma.organism.create({
      data: {
        scientificName: 'Aggregatibacter actinomycetemcomitans',
        commonName: 'A. actinomycetemcomitans',
        taxonomyId: 714,
        description: 'Gram-negative bacterium associated with aggressive periodontitis and endocarditis',
        habitat: 'Oral cavity',
        genomeSizeMb: 2.33
      }
    });
    console.log(`✅ Created organism: ${organism.id}`);
  } else {
    console.log(`✅ Found existing organism: ${organism.id}`);
  }
  
  // 2. Find or create the chromosome
  let chromosome = await prisma.chromosome.findFirst({
    where: {
      organismId: organism.id,
      accession: 'CP076449.1'
    }
  });
  
  if (!chromosome) {
    console.log('Creating chromosome CP076449.1...');
    chromosome = await prisma.chromosome.create({
      data: {
        name: 'Chromosome',
        accession: 'CP076449.1',
        description: 'Complete genome of A. actinomycetemcomitans strain CU1000N',
        lengthMb: 2.33,
        sequenceLength: 2331529,
        gcContent: null,
        organismId: organism.id
      }
    });
    console.log(`✅ Created chromosome: ${chromosome.id}`);
  } else {
    console.log(`✅ Found existing chromosome: ${chromosome.id}`);
  }
  
  // 3. Load protein sequences from FASTA
  const proteinFastaPath = path.join(process.cwd(), 'data', 'proteins', 'CP076449_proteins.fasta');
  console.log('📖 Loading protein sequences...');
  const fastaEntries = await parseFastaFile(proteinFastaPath);
  console.log(`✅ Loaded ${fastaEntries.size} protein entries`);
  
  // 4. Get leukotoxin system definition
  const ltxSystem = getLeukotoxinSystem();
  console.log(`\n🦠 Processing Leukotoxin T1SS system (${ltxSystem.components.length} components)...`);
  
  // 5. Create or update genes and proteins for each component
  const systemComponentRecords = [];
  
  for (const component of ltxSystem.components) {
    console.log(`\n  Processing ${component.locusTag} (${component.product})...`);
    
    // Get sequence from FASTA
    const fastaEntry = fastaEntries.get(component.locusTag);
    const sequence = fastaEntry?.sequence || '';
    
    // Create or find gene
    let gene = await prisma.gene.findFirst({
      where: {
        locus_tag: component.locusTag,
        chromosomeId: chromosome.id
      }
    });
    
    if (!gene) {
      gene = await prisma.gene.create({
        data: {
          symbol: component.geneName || component.locusTag,
          name: component.product,
          description: component.product,
          locus_tag: component.locusTag,
          startPosition: component.location.start,
          endPosition: component.location.end,
          strand: component.location.strand,
          organismId: organism.id,
          chromosomeId: chromosome.id
        }
      });
      console.log(`    ✅ Created gene: ${gene.symbol}`);
    } else {
      console.log(`    ✅ Found existing gene: ${gene.symbol}`);
    }
    
    // Create or find protein
    let protein = await prisma.protein.findFirst({
      where: {
        accession: component.proteinId
      }
    });
    
    if (!protein) {
      const seqLength = sequence.length;
      // Approximate molecular weight (avg AA weight ~110 Da)
      const molWeight = seqLength > 0 ? seqLength * 0.11 : null;
      
      protein = await prisma.protein.create({
        data: {
          accession: component.proteinId,
          name: component.product,
          description: component.product,
          sequence: sequence,
          sequenceLength: seqLength,
          molecularWeight: molWeight,
          source: 'GenBank',
          geneId: gene.id
        }
      });
      console.log(`    ✅ Created protein: ${protein.accession} (${seqLength} aa)`);
    } else {
      console.log(`    ✅ Found existing protein: ${protein.accession}`);
    }
    
    // Classify secretion info
    const classification = classifySecretionPathway(component.product, component.locusTag);
    
    // Create or update secretion info
    const secretionInfo = await prisma.proteinSecretionInfo.upsert({
      where: {
        proteinId: protein.id
      },
      create: {
        proteinId: protein.id,
        isSecreted: classification.isSecreted,
        secretionPathway: classification.pathway,
        isSecretionMachinery: classification.isSecretionMachinery,
        secretionSystemType: classification.isSecretionMachinery ? 'T1SS' : null,
        systemComponent: classification.componentType,
        predictedLocation: component.componentType === 'Toxin' ? 'Extracellular' :
                          component.componentType === 'Adaptor' ? 'Periplasmic' :
                          component.componentType === 'ATPase/Permease' ? 'InnerMembrane' :
                          'Cytoplasmic',
        predictionMethod: 'Manual curation',
        dataSource: 'GenBank + Literature'
      },
      update: {
        isSecreted: classification.isSecreted,
        secretionPathway: classification.pathway,
        isSecretionMachinery: classification.isSecretionMachinery,
        secretionSystemType: classification.isSecretionMachinery ? 'T1SS' : null,
        systemComponent: classification.componentType,
        updatedAt: new Date()
      }
    });
    console.log(`    ✅ Updated secretion info`);
    
    systemComponentRecords.push({
      component,
      gene,
      protein,
      secretionInfo
    });
  }
  
  // 6. Create the SecretionSystem record
  console.log('\n🔧 Creating secretion system record...');
  
  let secretionSystem = await prisma.secretionSystem.findFirst({
    where: {
      name: ltxSystem.name,
      organismId: organism.id
    }
  });
  
  if (!secretionSystem) {
    secretionSystem = await prisma.secretionSystem.create({
      data: {
        name: ltxSystem.name,
        type: ltxSystem.type,
        description: ltxSystem.description,
        organismId: organism.id,
        chromosomeId: chromosome.id,
        startPosition: ltxSystem.components[0].location.start,
        endPosition: ltxSystem.components[ltxSystem.components.length - 1].location.end
      }
    });
    console.log(`✅ Created secretion system: ${secretionSystem.name}`);
  } else {
    console.log(`✅ Found existing secretion system: ${secretionSystem.name}`);
  }
  
  // 7. Create SecretionSystemComponent records
  console.log('\n🔗 Linking system components...');
  for (const record of systemComponentRecords) {
    const existing = await prisma.secretionSystemComponent.findFirst({
      where: {
        systemId: secretionSystem.id,
        locusTag: record.component.locusTag
      }
    });
    
    if (!existing) {
      await prisma.secretionSystemComponent.create({
        data: {
          systemId: secretionSystem.id,
          geneId: record.gene.id,
          proteinId: record.protein.id,
          locusTag: record.component.locusTag,
          componentName: record.component.geneName || record.component.product,
          componentType: record.component.componentType,
          description: record.component.product,
          genomicStart: record.component.location.start,
          genomicEnd: record.component.location.end
        }
      });
      console.log(`  ✅ Linked ${record.component.locusTag}`);
    } else {
      console.log(`  ✅ Already linked ${record.component.locusTag}`);
    }
  }
  
  // 8. Create cargo relationship for LtxA
  console.log('\n📦 Creating cargo relationship...');
  const ltxARecord = systemComponentRecords.find(r => r.component.geneName === 'ltxA');
  if (ltxARecord) {
    const existing = await prisma.secretionSystemCargo.findFirst({
      where: {
        systemId: secretionSystem.id,
        proteinId: ltxARecord.protein.id
      }
    });
    
    if (!existing) {
      await prisma.secretionSystemCargo.create({
        data: {
          systemId: secretionSystem.id,
          proteinId: ltxARecord.protein.id,
          cargoType: 'Toxin',
          isKnown: true,
          evidenceSource: 'Literature (PMC3949334, PMC3405016)'
        }
      });
      console.log(`✅ Created cargo relationship for LtxA`);
    } else {
      console.log(`✅ Cargo relationship already exists for LtxA`);
    }
  }
  
  console.log('\n✨ Secretome seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - Organism: ${organism.scientificName}`);
  console.log(`  - Chromosome: ${chromosome.accession}`);
  console.log(`  - Secretion System: ${secretionSystem.name}`);
  console.log(`  - Components: ${systemComponentRecords.length}`);
  console.log(`  - Genes created/updated: ${systemComponentRecords.length}`);
  console.log(`  - Proteins created/updated: ${systemComponentRecords.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
