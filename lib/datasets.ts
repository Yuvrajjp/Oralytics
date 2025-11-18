import { promises as fs } from "node:fs";
import path from "node:path";
import type { DatasetSummary, OmicDataset, SeededPayload } from "./types";

const SEEDED_PATH = path.join(process.cwd(), "data/seeded/datasets.json");

// In-memory cache to avoid repeated file I/O
let cachedSeededData: SeededPayload | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function readSeededFile(): Promise<SeededPayload> {
  const file = await fs.readFile(SEEDED_PATH, "utf-8");
  return JSON.parse(file) as SeededPayload;
}

export async function getSeededData(): Promise<SeededPayload> {
  try {
    // Check if cache is valid
    const now = Date.now();
    if (cachedSeededData && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL_MS) {
      return cachedSeededData;
    }

    // Reload from file and update cache
    const seededData = await readSeededFile();
    cachedSeededData = seededData;
    cacheTimestamp = now;
    return seededData;
  } catch (error) {
    console.error("Unable to load seeded data", error);
    // Return cached data if available, even if stale
    if (cachedSeededData) {
      return cachedSeededData;
    }
    return {
      datasets: [],
      summary: {
        totalDatasets: 0,
        totalSamples: 0,
        totalFeatures: 0,
        layerBreakdown: {},
      },
      seededAt: new Date(0).toISOString(),
    };
  }
}

export async function getDatasets(): Promise<OmicDataset[]> {
  const { datasets } = await getSeededData();
  return datasets;
}

export async function getSummary(): Promise<DatasetSummary> {
  const { summary } = await getSeededData();
  return summary;
}
