import { promises as fs } from "node:fs";
import path from "node:path";
import type { Gene, Organism } from "./types";

const ORGANISM_PATH = path.join(process.cwd(), "data/seeded/organisms.json");

interface OrganismStore {
  organisms: Organism[];
}

// In-memory cache to avoid repeated file I/O
let cachedOrganisms: Organism[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function readOrganismFile(): Promise<OrganismStore> {
  const payload = await fs.readFile(ORGANISM_PATH, "utf-8");
  return JSON.parse(payload) as OrganismStore;
}

export async function getOrganisms(): Promise<Organism[]> {
  try {
    // Check if cache is valid
    const now = Date.now();
    if (cachedOrganisms && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL_MS) {
      return cachedOrganisms;
    }

    // Reload from file and update cache
    const { organisms } = await readOrganismFile();
    cachedOrganisms = organisms;
    cacheTimestamp = now;
    return organisms;
  } catch (error) {
    console.error("Unable to read organism store", error);
    // Return cached data if available, even if stale
    return cachedOrganisms ?? [];
  }
}

export async function getOrganismById(id: string): Promise<Organism | undefined> {
  const organisms = await getOrganisms();
  return organisms.find((organism) => organism.id === id);
}

export async function getGeneWithOrganism(
  organismId: string,
  geneId: string
): Promise<{ organism: Organism; gene: Gene } | null> {
  const organism = await getOrganismById(organismId);
  if (!organism) {
    return null;
  }

  const gene = organism.genes.find((entry) => entry.id === geneId);
  if (!gene) {
    return null;
  }

  return { organism, gene };
}
