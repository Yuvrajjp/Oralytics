import { promises as fs } from "node:fs";
import path from "node:path";
import { runEtl } from "./etl.mjs";

const SEEDED_PATH = path.join(process.cwd(), "data/seeded/datasets.json");

async function seed() {
  const payload = await runEtl();
  await fs.mkdir(path.dirname(SEEDED_PATH), { recursive: true });
  await fs.writeFile(
    SEEDED_PATH,
    JSON.stringify(
      {
        ...payload,
        seededAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
  console.log(`Seeded datasets for the explorer → ${SEEDED_PATH}`);
}

if (process.argv[1]?.includes("scripts/seed.mjs")) {
  seed().catch((error) => {
    console.error("Seeding failed", error);
    process.exit(1);
  });
}
