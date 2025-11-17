/*
  Warnings:

  - A unique constraint covering the columns `[accession]` on the table `Chromosome` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chromosomeId,locus_tag]` on the table `Gene` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Chromosome" ADD COLUMN     "accession" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "gcContent" DOUBLE PRECISION,
ADD COLUMN     "sequenceLength" INTEGER;

-- AlterTable
ALTER TABLE "Gene" ADD COLUMN     "locus_tag" TEXT;

-- AlterTable
ALTER TABLE "OrganismProfile" ADD COLUMN     "estimatedGenes" INTEGER,
ADD COLUMN     "estimatedProteins" INTEGER,
ADD COLUMN     "genomeSize" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Chromosome_accession_key" ON "Chromosome"("accession");

-- CreateIndex
CREATE UNIQUE INDEX "Gene_chromosomeId_locus_tag_key" ON "Gene"("chromosomeId", "locus_tag");
