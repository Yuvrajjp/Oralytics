import { NextResponse } from "next/server";
import type { GeneListResponse } from "../../../../../lib/api-types";
import { serializeGeneSummary } from "../../../../../lib/gene-serializers";
import { listGenes } from "../../../../../lib/queries";
import prisma from "../../../../../lib/db";

interface RouteContext {
  params: Promise<{ organismId?: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { organismId } = await context.params;
  if (!organismId) {
    return NextResponse.json({ error: "organismId is required" }, { status: 400 });
  }

  try {
    const genes = await listGenes({ organismId });
    
    // Check if organism exists by verifying we got genes or checking the first gene's organism
    if (genes.length === 0) {
      // Verify organism exists with a lightweight query
      const organism = await prisma.organism.findUnique({
        where: { id: organismId },
        select: { id: true, scientificName: true, commonName: true },
      });
      
      if (!organism) {
        return NextResponse.json({ error: "Organism not found" }, { status: 404 });
      }
      
      const payload: GeneListResponse = {
        organism: {
          id: organism.id,
          scientificName: organism.scientificName,
          commonName: organism.commonName ?? null,
        },
        genes: [],
      };
      return NextResponse.json(payload);
    }

    // Use organism data from the first gene to avoid redundant query
    const organism = genes[0].organism;
    const payload: GeneListResponse = {
      organism: {
        id: organism.id,
        scientificName: organism.scientificName,
        commonName: organism.commonName ?? null,
      },
      genes: genes.map((gene: any) => serializeGeneSummary(gene)),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error(`Unable to load genes for organism ${organismId}`, error);
    return NextResponse.json({ error: "Unable to load genes" }, { status: 500 });
  }
}
