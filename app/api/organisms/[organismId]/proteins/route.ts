import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ organismId?: string }> }
) {
  try {
    const resolvedParams = (await (context as any).params) as {
      organismId?: string;
    };
    const { organismId } = resolvedParams;

    if (!organismId) {
      return NextResponse.json(
        { error: "Organism ID is required" },
        { status: 400 }
      );
    }

    // Get all genes and proteins for the organism
    const genes = await prisma.gene.findMany({
      where: { organismId },
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
      },
    });

    // Get organism details
    const organism = await prisma.organism.findUnique({
      where: { id: organismId },
      select: {
        scientificName: true,
        commonName: true,
      },
    });

    if (!organism) {
      return NextResponse.json(
        { error: "Organism not found" },
        { status: 404 }
      );
    }

    // Flatten the structure: each protein includes its gene symbol
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
        organism: organism.commonName || organism.scientificName,
      }))
    );

    return NextResponse.json({
      organism: {
        id: organismId,
        name: organism.commonName || organism.scientificName,
      },
      totalProteins: proteins.length,
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
