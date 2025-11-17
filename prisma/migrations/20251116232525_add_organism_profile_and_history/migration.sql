/*
  Warnings:

  - You are about to alter the column `relevanceScore` on the `GeneArticle` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Chromosome" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Gene" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "GeneArticle" ALTER COLUMN "relevanceScore" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Organism" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Protein" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "OrganismProfile" (
    "id" TEXT NOT NULL,
    "organismId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "gramStain" TEXT,
    "cellShape" TEXT,
    "cellArrangement" TEXT,
    "motility" TEXT,
    "gcContent" DOUBLE PRECISION,
    "genomeDescription" TEXT,
    "cultivability" TEXT,
    "temperatureOptimal" DOUBLE PRECISION,
    "temperatureRange" TEXT,
    "phOptimal" DOUBLE PRECISION,
    "phRange" TEXT,
    "habitat" TEXT,
    "ecologyDescription" TEXT,
    "pathogenicity" TEXT,
    "pangenomeInfo" TEXT,
    "ncbiTaxonId" INTEGER,
    "homdUrl" TEXT,
    "bacdiveUrl" TEXT,
    "bacdiveId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganismProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileHistory" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "organismId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "changeField" TEXT,
    "previousValue" TEXT,
    "newValue" TEXT,
    "changeReason" TEXT,
    "dataSource" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT,
    "notes" TEXT,

    CONSTRAINT "ProfileHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganismProfile_organismId_key" ON "OrganismProfile"("organismId");

-- CreateIndex
CREATE INDEX "ProfileHistory_profileId_idx" ON "ProfileHistory"("profileId");

-- CreateIndex
CREATE INDEX "ProfileHistory_organismId_idx" ON "ProfileHistory"("organismId");

-- CreateIndex
CREATE INDEX "ProfileHistory_changedAt_idx" ON "ProfileHistory"("changedAt");

-- AddForeignKey
ALTER TABLE "OrganismProfile" ADD CONSTRAINT "OrganismProfile_organismId_fkey" FOREIGN KEY ("organismId") REFERENCES "Organism"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileHistory" ADD CONSTRAINT "ProfileHistory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "OrganismProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileHistory" ADD CONSTRAINT "ProfileHistory_organismId_fkey" FOREIGN KEY ("organismId") REFERENCES "Organism"("id") ON DELETE CASCADE ON UPDATE CASCADE;
