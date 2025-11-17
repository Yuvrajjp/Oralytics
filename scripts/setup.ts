import { access, copyFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { exec as execCallback } from "node:child_process";

const exec = promisify(execCallback);
const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env");
const envExamplePath = path.join(rootDir, ".env.example");

async function ensureEnvFile() {
  try {
    await access(envPath);
    console.log("✅ .env already exists");
  } catch {
    await copyFile(envExamplePath, envPath);
    console.log("✅ Created .env from .env.example — update DATABASE_URL before running migrations");
  }
}

async function generatePrismaClient() {
  console.log("▶️ Generating Prisma client...");
  await exec("npx prisma generate", { stdio: "inherit" });
  console.log("✅ Prisma client ready");
}

async function main() {
  await ensureEnvFile();
  await generatePrismaClient();

  console.log("\nNext steps:");
  console.log("  - Update .env with your Postgres credentials");
  console.log("  - Run 'npm run db:migrate' to apply the schema");
  console.log("  - Run 'npm run db:seed' to load the sample organisms and genes");
  console.log("  - Start the app with 'npm run dev'");
}

main().catch((error) => {
  console.error("Setup failed", error);
  process.exit(1);
});
