import { NextResponse } from "next/server";
import type { SearchResponse } from "../../../lib/api-types";
import { searchOrganismsAndGenes } from "../../../lib/queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const trimmed = query.trim();

  if (!trimmed) {
    return NextResponse.json({ error: "q parameter is required" }, { status: 400 });
  }

  try {
    const { organisms, genes } = await searchOrganismsAndGenes(trimmed);
    const payload: SearchResponse = {
      query: trimmed,
      organisms: organisms.map((organism) => ({
        id: organism.id,
        scientificName: organism.scientificName,
        commonName: organism.commonName ?? null,
        habitat: organism.habitat ?? null,
        geneCount: organism.genes.length,
      })),
      genes: genes.map((gene) => ({
        id: gene.id,
        symbol: gene.symbol,
        name: gene.name,
        description: gene.description ?? null,
        organism: {
          id: gene.organism.id,
          scientificName: gene.organism.scientificName,
          commonName: gene.organism.commonName ?? null,
        },
      })),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error(`Search failed for query ${trimmed}`, error);
    return NextResponse.json({ error: "Unable to search" }, { status: 500 });
  }
}
