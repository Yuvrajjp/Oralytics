import { promises as fs } from "node:fs";
import path from "node:path";
import type { DatasetSummary, OmicDataset, SeededPayload } from "./types";

const SEEDED_PATH = path.join(process.cwd(), "data/seeded/datasets.json");

async function readSeededFile(): Promise<SeededPayload> {
  const file = await fs.readFile(SEEDED_PATH, "utf-8");
  return JSON.parse(file) as SeededPayload;
}

export async function getSeededData(): Promise<SeededPayload> {
  try {
    return await readSeededFile();
  } catch (error) {
    console.error("Unable to load seeded data", error);
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
