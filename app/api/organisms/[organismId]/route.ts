import { NextResponse } from "next/server";
import type { OrganismDetailResponse } from "../../../../lib/api-types";
import { getOrganismRecord } from "../../../../lib/queries";

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

    const payload: OrganismDetailResponse = {
      organism: {
        id: organism.id,
        scientificName: organism.scientificName,
        commonName: organism.commonName ?? null,
        habitat: organism.habitat ?? null,
        description: organism.description ?? null,
        genomeSizeMb: organism.genomeSizeMb ?? null,
        chromosomeCount: organism.chromosomes.length,
        geneCount: organism.genes.length,
        chromosomes: organism.chromosomes.map((chromosome) => ({
          id: chromosome.id,
          name: chromosome.name,
          lengthMb: chromosome.lengthMb ?? null,
        })),
        highlightedGenes: organism.genes.slice(0, 3).map((gene) => ({
          id: gene.id,
          symbol: gene.symbol,
        })),
        taxonomyId: organism.taxonomyId ?? null,
      },
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error(`Unable to load organism ${organismId}`, error);
    return NextResponse.json({ error: "Unable to load organism" }, { status: 500 });
  }
}
