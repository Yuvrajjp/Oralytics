-- CreateTable
CREATE TABLE "Organism" (
    "id" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "commonName" TEXT,
    "taxonomyId" INTEGER,
    "description" TEXT,
    "habitat" TEXT,
    "genomeSizeMb" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Organism_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chromosome" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lengthMb" DOUBLE PRECISION,
    "organismId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Chromosome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gene" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startPosition" INTEGER,
    "endPosition" INTEGER,
    "strand" TEXT,
    "organismId" TEXT NOT NULL,
    "chromosomeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Gene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Protein" (
    "id" TEXT NOT NULL,
    "accession" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sequenceLength" INTEGER,
    "molecularWeight" DOUBLE PRECISION,
    "localization" TEXT,
    "geneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Protein_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "doi" TEXT,
    "journal" TEXT,
    "publishedAt" TIMESTAMP(3),
    "url" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneArticle" (
    "geneId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "keyFinding" TEXT,
    "relevanceScore" DOUBLE PRECISION,
    CONSTRAINT "GeneArticle_pkey" PRIMARY KEY ("geneId","articleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gene_organismId_symbol_key" ON "Gene"("organismId", "symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Protein_accession_key" ON "Protein"("accession");

-- CreateIndex
CREATE UNIQUE INDEX "Article_doi_key" ON "Article"("doi");

-- AddForeignKey
ALTER TABLE "Chromosome" ADD CONSTRAINT "Chromosome_organismId_fkey" FOREIGN KEY ("organismId") REFERENCES "Organism"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gene" ADD CONSTRAINT "Gene_organismId_fkey" FOREIGN KEY ("organismId") REFERENCES "Organism"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gene" ADD CONSTRAINT "Gene_chromosomeId_fkey" FOREIGN KEY ("chromosomeId") REFERENCES "Chromosome"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Protein" ADD CONSTRAINT "Protein_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES "Gene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneArticle" ADD CONSTRAINT "GeneArticle_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES "Gene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneArticle" ADD CONSTRAINT "GeneArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
