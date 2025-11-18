import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Only initialize Prisma if not in build mode
let prisma: PrismaClient;

try {
  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["warn", "error"],
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
} catch (error) {
  // During build time, Prisma might not be fully initialized
  console.warn("Prisma client initialization skipped (build time or missing database)");
  prisma = {} as PrismaClient;
}

export { prisma };
export default prisma;
