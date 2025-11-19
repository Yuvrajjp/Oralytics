import { promises as fs } from "node:fs";
import path from "node:path";
import type { Gene, Organism } from "./types";

const ORGANISM_PATH = path.join(process.cwd(), "data/seeded/organisms.json");

interface OrganismStore {
  organisms: Organism[];
}

async function readOrganismFile(): Promise<OrganismStore> {
  const payload = await fs.readFile(ORGANISM_PATH, "utf-8");
  return JSON.parse(payload) as OrganismStore;
}

export async function getOrganisms(): Promise<Organism[]> {
  try {
    const { organisms } = await readOrganismFile();
    return organisms;
  } catch (error) {
    console.error("Unable to read organism store", error);
    return [];
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
