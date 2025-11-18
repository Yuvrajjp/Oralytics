import { NextResponse } from "next/server";
import type { GeneListResponse } from "../../../../../lib/api-types";
import { serializeGeneSummary } from "../../../../../lib/gene-serializers";
import { getOrganismRecord, listGenes } from "../../../../../lib/queries";

interface RouteContext {
  params: Promise<{ organismId?: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { organismId } = await context.params;
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
      genes: genes.map((gene: any) => serializeGeneSummary(gene)),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error(`Unable to load genes for organism ${organismId}`, error);
    return NextResponse.json({ error: "Unable to load genes" }, { status: 500 });
  }
}
