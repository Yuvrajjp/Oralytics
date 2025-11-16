import { NextResponse } from "next/server";
import type { GeneListResponse } from "../../../../../lib/api-types";
import { getOrganismRecord, listGenes } from "../../../../../lib/queries";

interface RouteContext {
  params: { organismId?: string };
}

export async function GET(_request: Request, context: RouteContext) {
  const organismId = context.params.organismId;
  if (!organismId) {
    return NextResponse.json({ error: "organismId is required" }, { status: 400 });
  }

  try {
    const organism = await getOrganismRecord(organismId);
    if (!organism) {
      return NextResponse.json({ error: "Organism not found" }, { status: 404 });
    }

    const genes = await listGenes({ organismId });
    const payload: GeneListResponse = {
      organism: {
        id: organism.id,
        scientificName: organism.scientificName,
        commonName: organism.commonName ?? null,
      },
      genes: genes.map((gene) => ({
        id: gene.id,
        symbol: gene.symbol,
        name: gene.name,
        description: gene.description ?? null,
        startPosition: gene.startPosition ?? null,
        endPosition: gene.endPosition ?? null,
        strand: gene.strand ?? null,
        chromosome: gene.chromosome
          ? { id: gene.chromosome.id, name: gene.chromosome.name, lengthMb: null }
          : null,
      })),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error(`Unable to load genes for organism ${organismId}`, error);
    return NextResponse.json({ error: "Unable to load genes" }, { status: 500 });
  }
}
