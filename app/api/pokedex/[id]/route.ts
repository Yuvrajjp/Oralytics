import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { MicrobialPokedexEntry } from "@/lib/pokedex-types";

/**
 * GET /api/pokedex/[id]
 * Get a single Pokedex entry with all related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const entry = await prisma.microbialPokedexEntry.findUnique({
      where: { id },
      include: {
        organism: {
          select: {
            id: true,
            scientificName: true,
            commonName: true,
          },
        },
        geneProteinMappings: {
          include: {
            gene: true,
            protein: true,
          },
        },
        alphaFoldPredictions: {
          include: {
            protein: true,
            confidenceRegions: true,
          },
        },
        virulenceFactors: {
          include: {
            gene: true,
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Pokedex entry not found" },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const parseJson = (field: string | null) => {
      if (!field) return undefined;
      try {
        return JSON.parse(field);
      } catch {
        return field;
      }
    };

    // Transform database entry to API response format
    const response: { entry: Partial<MicrobialPokedexEntry> } = {
      entry: {
        id: entry.id,
        pokedexNumber: entry.pokedexNumber,
        organism: {
          id: entry.organism.id,
          scientificName: entry.organism.scientificName,
          commonName: entry.organism.commonName || undefined,
        },
        nickname: entry.nickname || undefined,
        discoveredBy: entry.discoveredBy || undefined,
        discoveryYear: entry.discoveryYear || undefined,
        rarity: (entry.rarity as "Common" | "Uncommon" | "Rare" | "Legendary") || "Common",
        
        genomics: {
          dnaSequence: entry.genomicDnaSequence || undefined,
          rnaSequence: entry.rnaSequence || undefined,
          gcContent: entry.gcContent || undefined,
          genomeCompleteness: entry.genomeCompleteness || undefined,
          chromosomalOrganization: [], // Would need to be populated from related data
        },
        
        phenotype: {
          cellMorphology: entry.cellMorphology || undefined,
          metabolism: entry.metabolism || undefined,
          oxygenRequirement: entry.oxygenRequirement || undefined,
          optimalTemperature: entry.optimalTemperature || undefined,
          optimalPh: entry.optimalPh || undefined,
        },
        
        ecology: {
          primaryHabitat: entry.primaryHabitat || undefined,
          ecologicalNiche: entry.ecologicalNiche || undefined,
          symbioticRelations: entry.symbioticRelations || undefined,
        },
        
        geneProteinMappings: entry.geneProteinMappings.map((mapping) => ({
          geneLocus: mapping.locusTag || mapping.geneSymbol || "Unknown",
          codingSequence: mapping.codingSequence || "",
          translatedSequence: mapping.translatedSequence || "",
          startCodon: mapping.startCodon || "ATG",
          stopCodon: mapping.stopCodon || "TAA",
          readingFrame: mapping.translationFrame || 0,
          proteinLength: mapping.proteinLength || 0,
          molecularWeight: mapping.molecularWeight || 0,
        })),
        
        alphaFoldPredictions: entry.alphaFoldPredictions.map((pred) => ({
          alphafoldId: pred.alphafoldId || "",
          modelVersion: pred.modelVersion || "Unknown",
          pdbUrl: pred.pdbUrl || "",
          meanPlddtScore: pred.meanPlddtScore || 0,
          ptmScore: pred.ptmScore || undefined,
          paeValue: pred.paeValue || undefined,
          domainCount: pred.domainCount || undefined,
          secondaryStructure: parseJson(pred.secondaryStructure),
          confidenceRegions: pred.confidenceRegions.map((region) => ({
            startResidue: region.startResidue,
            endResidue: region.endResidue,
            confidenceLevel: region.confidenceLevel as "Very high" | "High" | "Medium" | "Low",
            plddtScore: region.plddtScore,
            structuralFeature: region.structuralFeature || undefined,
            functionalImportance: region.functionalImportance || undefined,
          })),
        })),
        
        researchData: {
          relativeAbundance: entry.relativeAbundance || 0,
          diseaseAssociations: parseJson(entry.diseaseAssociations) || [],
          virulenceFactors: entry.virulenceFactors.map((factor) => ({
            factorName: factor.factorName,
            factorType: factor.factorType || "",
            description: factor.description || "",
            virulenceScore: factor.virulenceScore || 0,
            mechanismOfAction: factor.mechanismOfAction || undefined,
            targetTissue: factor.targetTissue || undefined,
            evidenceLevel: (factor.evidenceLevel as "Confirmed" | "Probable" | "Predicted") || "Predicted",
            dataSource: factor.dataSource || undefined,
          })),
          biofilmCapability: (entry.biofilmCapability as "High" | "Medium" | "Low" | "None") || "None",
          pathogenicityScore: entry.pathogenicityScore || 0,
          clinicalRelevance: "", // Would need to be stored separately
        },
        
        metabolicProfile: parseJson(entry.metabolicPathways),
        antibioticResistance: parseJson(entry.antibioticResistance),
        
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching Pokedex entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch Pokedex entry" },
      { status: 500 }
    );
  }
}
