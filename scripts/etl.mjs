import { promises as fs } from "node:fs";
import path from "node:path";

const RAW_PATH = path.join(process.cwd(), "data/raw/omics.csv");
const PROCESSED_PATH = path.join(process.cwd(), "data/processed/datasets.json");
const SOURCE_REFERENCE = path.relative(process.cwd(), RAW_PATH);

function parseCsv(contents) {
  const [headerLine, ...rows] = contents.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  return rows
    .map((row) => row.split(","))
    .filter((cols) => cols.length === headers.length)
    .map(([dataset_id, dataset_name, omic_layer, samples, features, last_updated]) => ({
      dataset_id,
      dataset_name,
      omic_layer,
      samples: Number(samples),
      features: Number(features),
      last_updated,
    }));
}

function toDataset(record) {
  return {
    id: record.dataset_id,
    name: record.dataset_name,
    layer: record.omic_layer,
    sampleCount: record.samples,
    featureCount: record.features,
    lastUpdated: record.last_updated,
    description: "Auto-generated from the latest ingestion CSV.",
  };
}

function summarize(datasets) {
  return datasets.reduce(
    (acc, dataset) => {
      acc.totalDatasets += 1;
      acc.totalSamples += dataset.sampleCount;
      acc.totalFeatures += dataset.featureCount;
      acc.layerBreakdown[dataset.layer] =
        (acc.layerBreakdown[dataset.layer] ?? 0) + 1;
      return acc;
    },
    { totalDatasets: 0, totalSamples: 0, totalFeatures: 0, layerBreakdown: {} }
  );
}

export async function runEtl() {
  const csv = await fs.readFile(RAW_PATH, "utf-8");
  const rawRecords = parseCsv(csv);
  const datasets = rawRecords.map(toDataset);
  const summary = summarize(datasets);

  await fs.mkdir(path.dirname(PROCESSED_PATH), { recursive: true });
  await fs.writeFile(
    PROCESSED_PATH,
    JSON.stringify(
      {
        datasets,
        summary,
        generatedAt: new Date().toISOString(),
        source: SOURCE_REFERENCE,
      },
      null,
      2
    )
  );

  console.log(`Processed ${datasets.length} datasets → ${PROCESSED_PATH}`);
  return { datasets, summary };
}

if (process.argv[1]?.includes("scripts/etl.mjs")) {
  runEtl().catch((error) => {
    console.error("ETL run failed", error);
    process.exit(1);
  });
}
