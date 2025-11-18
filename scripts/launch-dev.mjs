import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import path from "node:path";

const logFile = path.join(process.cwd(), "next-dev.log");
const logStream = createWriteStream(logFile, { flags: "a" });

const devProcess = spawn("npm", ["run", "dev"], {
  stdio: ["inherit", "pipe", "pipe"],
  env: process.env,
});

devProcess.stdout?.pipe(process.stdout);
devProcess.stdout?.pipe(logStream);
devProcess.stderr?.pipe(process.stderr);
devProcess.stderr?.pipe(logStream);

devProcess.on("close", (code, signal) => {
  const exitStatus = code === null ? `signal ${signal ?? "unknown"}` : `code ${code}`;
  console.log(`Dev server exited with ${exitStatus}`);
});
