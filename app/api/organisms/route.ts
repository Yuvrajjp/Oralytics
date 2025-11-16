import { NextResponse } from "next/server";
import { listOrganisms } from "../../../lib/queries";
import type { OrganismListResponse } from "../../../lib/api-types";

export async function GET() {
  try {
    const organisms = await listOrganisms();
    const payload: OrganismListResponse = {
      organisms: organisms.map((organism) => ({
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
      })),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Unable to load organisms", error);
    return NextResponse.json({ error: "Unable to load organisms" }, { status: 500 });
  }
}
