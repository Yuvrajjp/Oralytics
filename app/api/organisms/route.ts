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
        geneCount: organism._count.genes, // Use the count from the query instead of array length
        chromosomes: organism.chromosomes.map((chromosome) => ({
          id: chromosome.id,
          name: chromosome.name,
          lengthMb: chromosome.lengthMb ?? null,
        })),
        highlightedGenes: organism.genes.slice(0, 3).map((gene: any) => ({
        highlightedGenes: organism.genes.map((gene) => ({
          id: gene.id,
          symbol: gene.symbol,
        })),
      })),
    };

    const response = NextResponse.json(payload);
    
    // Add cache headers for better performance (2 minutes for organism list)
    response.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    
    return response;
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
