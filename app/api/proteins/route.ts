import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get all genes with their proteins and organism info
    const genes = await prisma.gene.findMany({
      include: {
        proteins: {
          select: {
            id: true,
            accession: true,
            name: true,
            description: true,
            sequenceLength: true,
            molecularWeight: true,
            localization: true,
          },
        },
        organism: {
          select: {
            id: true,
            scientificName: true,
            commonName: true,
          },
        },
      },
    });

    // Flatten and structure the response
    const proteins = genes.flatMap((gene: any) =>
      gene.proteins.map((protein: any) => ({
        id: protein.id,
        accession: protein.accession,
        name: protein.name,
        description: protein.description,
        sequenceLength: protein.sequenceLength,
        molecularWeight: protein.molecularWeight,
        localization: protein.localization,
        geneName: gene.symbol,
        geneId: gene.id,
        organismId: gene.organism.id,
        organismName: gene.organism.commonName || gene.organism.scientificName,
      }))
    );

    // Count by organism
    const proteinsByOrganism = genes.reduce(
      (acc: Record<string, number>, gene: any) => {
        const orgName = gene.organism.commonName || gene.organism.scientificName;
        acc[orgName] = (acc[orgName] || 0) + gene.proteins.length;
        return acc;
      },
      {}
    );

    // Count by localization
    const proteinsByLocalization = proteins.reduce(
      (acc: Record<string, number>, protein: any) => {
        acc[protein.localization || "Unknown"] =
          (acc[protein.localization || "Unknown"] || 0) + 1;
        return acc;
      },
      {}
    );

    // Calculate statistics
    const stats = {
      totalProteins: proteins.length,
      totalGenes: genes.length,
      totalOrganisms: genes.length > 0 
        ? new Set(genes.map((g: any) => g.organism.id)).size 
        : 0,
      averageMolecularWeight:
        proteins.length > 0
          ? (
              proteins.reduce((sum: number, p: any) => sum + (p.molecularWeight || 0), 0) /
              proteins.length
            ).toFixed(2)
          : 0,
      averageSequenceLength:
        proteins.length > 0
          ? (
              proteins.reduce((sum: number, p: any) => sum + (p.sequenceLength || 0), 0) /
              proteins.length
            ).toFixed(0)
          : 0,
      proteinsByOrganism,
      proteinsByLocalization,
    };

    return NextResponse.json({
      stats,
      proteins,
    });
  } catch (error) {
    console.error("Error fetching proteins:", error);
    return NextResponse.json(
      { error: "Failed to fetch proteins" },
      { status: 500 }
    );
  }
}
