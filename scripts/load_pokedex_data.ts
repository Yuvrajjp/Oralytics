#!/usr/bin/env tsx

/**
 * Script to load Pokedex data from JSON files into the database
 * 
 * Usage: tsx scripts/load_pokedex_data.ts
 */

import { PrismaClient } from "@prisma/client";
import { promises as fs } from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

interface PokedexJsonData {
  pokedexNumber: number;
  organism: {
    scientificName: string;
    commonName?: string;
  };
  nickname?: string;
  discoveredBy?: string;
  discoveryYear?: number;
  rarity: string;
  genomics: {
    dnaSequence?: string;
    rnaSequence?: string;
    gcContent?: number;
    genomeCompleteness?: number;
    chromosomalOrganization: Array<Record<string, unknown>>;
  };
  phenotype: {
    cellMorphology?: string;
    metabolism?: string;
    oxygenRequirement?: string;
    optimalTemperature?: number;
    optimalPh?: number;
    gramStain?: string;
    motility?: string;
  };
  ecology: {
    primaryHabitat?: string;
    ecologicalNiche?: string;
    symbioticRelations?: string;
  };
  geneProteinMappings: Array<Record<string, unknown>>;
  alphaFoldPredictions: Array<Record<string, unknown>>;
  researchData: {
    relativeAbundance: number;
    diseaseAssociations: Array<Record<string, unknown>>;
    virulenceFactors: Array<Record<string, unknown>>;
    biofilmCapability: string;
    pathogenicityScore: number;
    clinicalRelevance: string;
  };
  metabolicProfile?: Record<string, unknown>;
  antibioticResistance?: Record<string, unknown>;
}

async function loadPokedexData() {
  console.log("🚀 Starting Pokedex data loading...\n");

  const dataDir = path.join(process.cwd(), "data/pokedex");
  
  try {
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    console.log(`Found ${jsonFiles.length} Pokedex entry file(s)\n`);

    for (const file of jsonFiles) {
      const filePath = path.join(dataDir, file);
      console.log(`📄 Processing ${file}...`);

      const content = await fs.readFile(filePath, "utf-8");
      const data: PokedexJsonData = JSON.parse(content);

      // Find or create organism
      let organism = await prisma.organism.findFirst({
        where: { scientificName: data.organism.scientificName },
      });

      if (!organism) {
        console.log(`  Creating organism: ${data.organism.scientificName}`);
        organism = await prisma.organism.create({
          data: {
            scientificName: data.organism.scientificName,
            commonName: data.organism.commonName,
            description: `Pokedex entry organism`,
          },
        });
      }

      // Check if Pokedex entry already exists
      const existingEntry = await prisma.microbialPokedexEntry.findUnique({
        where: { pokedexNumber: data.pokedexNumber },
      });

      if (existingEntry) {
        console.log(`  ⚠️  Entry #${data.pokedexNumber} already exists, skipping...`);
        continue;
      }

      // Create Pokedex entry
      const entry = await prisma.microbialPokedexEntry.create({
        data: {
          organismId: organism.id,
          pokedexNumber: data.pokedexNumber,
          nickname: data.nickname,
          discoveredBy: data.discoveredBy,
          discoveryYear: data.discoveryYear,
          rarity: data.rarity,
          genomicDnaSequence: data.genomics.dnaSequence,
          rnaSequence: data.genomics.rnaSequence,
          gcContent: data.genomics.gcContent,
          genomeCompleteness: data.genomics.genomeCompleteness,
          cellMorphology: data.phenotype.cellMorphology,
          metabolism: data.phenotype.metabolism,
          oxygenRequirement: data.phenotype.oxygenRequirement,
          optimalTemperature: data.phenotype.optimalTemperature,
          optimalPh: data.phenotype.optimalPh,
          primaryHabitat: data.ecology.primaryHabitat,
          ecologicalNiche: data.ecology.ecologicalNiche,
          symbioticRelations: data.ecology.symbioticRelations,
          relativeAbundance: data.researchData.relativeAbundance,
          diseaseAssociations: JSON.stringify(data.researchData.diseaseAssociations),
          biofilmCapability: data.researchData.biofilmCapability,
          pathogenicityScore: data.researchData.pathogenicityScore,
          metabolicPathways: data.metabolicProfile ? JSON.stringify(data.metabolicProfile) : null,
          antibioticResistance: data.antibioticResistance ? JSON.stringify(data.antibioticResistance) : null,
        },
      });

      console.log(`  ✅ Created entry #${data.pokedexNumber}: ${data.organism.scientificName}`);

      // Create gene-protein mappings
      if (data.geneProteinMappings && data.geneProteinMappings.length > 0) {
        for (const mappingData of data.geneProteinMappings) {
          const mapping = mappingData as {
            codingSequence?: string;
            translatedSequence?: string;
            startCodon?: string;
            stopCodon?: string;
            readingFrame?: number;
            geneLocus?: string;
            proteinLength?: number;
            molecularWeight?: number;
          };
          await prisma.geneProteinMapping.create({
            data: {
              pokedexEntryId: entry.id,
              codingSequence: mapping.codingSequence,
              translatedSequence: mapping.translatedSequence,
              startCodon: mapping.startCodon,
              stopCodon: mapping.stopCodon,
              translationFrame: mapping.readingFrame,
              geneSymbol: mapping.geneLocus,
              locusTag: mapping.geneLocus,
              proteinLength: mapping.proteinLength,
              molecularWeight: mapping.molecularWeight,
            },
          });
        }
        console.log(`  ✅ Created ${data.geneProteinMappings.length} gene-protein mapping(s)`);
      }

      // Create AlphaFold predictions
      if (data.alphaFoldPredictions && data.alphaFoldPredictions.length > 0) {
        for (const predictionData of data.alphaFoldPredictions) {
          const prediction = predictionData as {
            alphafoldId?: string;
            modelVersion?: string;
            pdbUrl?: string;
            meanPlddtScore?: number;
            ptmScore?: number;
            paeValue?: number;
            domainCount?: number;
            secondaryStructure?: Record<string, unknown>;
            confidenceRegions?: Array<{
              startResidue?: number;
              endResidue?: number;
              confidenceLevel?: string;
              plddtScore?: number;
              structuralFeature?: string;
              functionalImportance?: string;
            }>;
          };
          const alphafold = await prisma.alphaFoldPrediction.create({
            data: {
              pokedexEntryId: entry.id,
              alphafoldId: prediction.alphafoldId,
              modelVersion: prediction.modelVersion,
              pdbUrl: prediction.pdbUrl,
              meanPlddtScore: prediction.meanPlddtScore,
              ptmScore: prediction.ptmScore,
              paeValue: prediction.paeValue,
              domainCount: prediction.domainCount,
              secondaryStructure: prediction.secondaryStructure ? JSON.stringify(prediction.secondaryStructure) : null,
            },
          });

          // Create confidence regions
          if (prediction.confidenceRegions && prediction.confidenceRegions.length > 0) {
            for (const region of prediction.confidenceRegions) {
              await prisma.confidenceRegion.create({
                data: {
                  predictionId: alphafold.id,
                  startResidue: region.startResidue ?? 0,
                  endResidue: region.endResidue ?? 0,
                  confidenceLevel: region.confidenceLevel ?? "Low",
                  plddtScore: region.plddtScore ?? 0,
                  structuralFeature: region.structuralFeature,
                  functionalImportance: region.functionalImportance,
                },
              });
            }
          }
        }
        console.log(`  ✅ Created ${data.alphaFoldPredictions.length} AlphaFold prediction(s)`);
      }

      // Create virulence factors
      if (data.researchData.virulenceFactors && data.researchData.virulenceFactors.length > 0) {
        for (const factorData of data.researchData.virulenceFactors) {
          const factor = factorData as {
            factorName?: string;
            factorType?: string;
            description?: string;
            virulenceScore?: number;
            mechanismOfAction?: string;
            targetTissue?: string;
            evidenceLevel?: string;
            dataSource?: string;
          };
          await prisma.virulenceFactor.create({
            data: {
              pokedexEntryId: entry.id,
              factorName: factor.factorName ?? "Unknown",
              factorType: factor.factorType,
              description: factor.description,
              virulenceScore: factor.virulenceScore,
              mechanismOfAction: factor.mechanismOfAction,
              targetTissue: factor.targetTissue,
              evidenceLevel: factor.evidenceLevel,
              dataSource: factor.dataSource,
            },
          });
        }
        console.log(`  ✅ Created ${data.researchData.virulenceFactors.length} virulence factor(s)`);
      }

      console.log();
    }

    console.log("✨ Pokedex data loading complete!\n");

    // Show summary
    const totalEntries = await prisma.microbialPokedexEntry.count();
    const totalMappings = await prisma.geneProteinMapping.count();
    const totalPredictions = await prisma.alphaFoldPrediction.count();
    const totalFactors = await prisma.virulenceFactor.count();

    console.log("📊 Database Summary:");
    console.log(`   Total Pokedex Entries: ${totalEntries}`);
    console.log(`   Gene-Protein Mappings: ${totalMappings}`);
    console.log(`   AlphaFold Predictions: ${totalPredictions}`);
    console.log(`   Virulence Factors: ${totalFactors}`);
  } catch (error) {
    console.error("❌ Error loading Pokedex data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
loadPokedexData()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
