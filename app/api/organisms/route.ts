import { NextResponse } from "next/server";
import { listOrganisms } from "../../../lib/queries";
import { getOrganisms } from "../../../lib/organisms";
import type { OrganismListResponse } from "../../../lib/api-types";

export async function GET() {
  try {
    const organisms = await listOrganisms();
    const payload: OrganismListResponse = {
      organisms: organisms.map((organism: any) => ({
        id: organism.id,
        scientificName: organism.scientificName,
        commonName: organism.commonName ?? null,
        habitat: organism.habitat ?? null,
        description: organism.description ?? null,
        genomeSizeMb: organism.genomeSizeMb ?? null,
        chromosomeCount: organism.chromosomes.length,
        geneCount: organism.genes.length,
        chromosomes: organism.chromosomes.map((chromosome: any) => ({
          id: chromosome.id,
          name: chromosome.name,
          lengthMb: chromosome.lengthMb ?? null,
        })),
        highlightedGenes: organism.genes.slice(0, 3).map((gene: any) => ({
          id: gene.id,
          symbol: gene.symbol,
        })),
      })),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Unable to load organisms", error);

    // Fallback to the static seeded JSON so the UI can render when the
    // database connection is unavailable (e.g., DATABASE_URL is missing).
    const seededOrganisms = await getOrganisms();
    const payload: OrganismListResponse = {
      organisms: seededOrganisms.map((organism: any) => ({
        id: organism.id,
        scientificName: organism.name,
        commonName: organism.aliases[0] ?? null,
        habitat: organism.habitats[0] ?? null,
        description: organism.description,
        genomeSizeMb: organism.genomeSizeMb,
        chromosomeCount: organism.chromosomeCount,
        geneCount: organism.genes.length,
        chromosomes: [],
        highlightedGenes: organism.genes.slice(0, 3).map((gene: any) => ({
          id: gene.id,
          symbol: gene.name,
        })),
        lineage: Object.values(organism.taxonomy),
      })),
    };

    return NextResponse.json(payload, { status: 200 });
  }
}
