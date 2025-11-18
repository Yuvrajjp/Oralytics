-- CreateTable
CREATE TABLE "MicrobialPokedexEntry" (
    "id" TEXT NOT NULL,
    "organismId" TEXT NOT NULL,
    "pokedexNumber" INTEGER NOT NULL,
    "nickname" TEXT,
    "discoveredBy" TEXT,
    "discoveryYear" INTEGER,
    "rarity" TEXT,
    "genomicDnaSequence" TEXT,
    "rnaSequence" TEXT,
    "gcContent" DOUBLE PRECISION,
    "genomeCompleteness" DOUBLE PRECISION,
    "cellMorphology" TEXT,
    "metabolism" TEXT,
    "oxygenRequirement" TEXT,
    "optimalTemperature" DOUBLE PRECISION,
    "optimalPh" DOUBLE PRECISION,
    "primaryHabitat" TEXT,
    "ecologicalNiche" TEXT,
    "symbioticRelations" TEXT,
    "relativeAbundance" DOUBLE PRECISION,
    "diseaseAssociations" TEXT,
    "biofilmCapability" TEXT,
    "pathogenicityScore" DOUBLE PRECISION,
    "metabolicPathways" TEXT,
    "antibioticResistance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MicrobialPokedexEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneProteinMapping" (
    "id" TEXT NOT NULL,
    "pokedexEntryId" TEXT NOT NULL,
    "geneId" TEXT,
    "proteinId" TEXT,
    "codingSequence" TEXT,
    "translatedSequence" TEXT,
    "startCodon" TEXT,
    "stopCodon" TEXT,
    "translationFrame" INTEGER,
    "geneSymbol" TEXT,
    "geneName" TEXT,
    "locusTag" TEXT,
    "chromosomalPosition" TEXT,
    "proteinLength" INTEGER,
    "molecularWeight" DOUBLE PRECISION,
    "isoelectricPoint" DOUBLE PRECISION,
    "proteinFunction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneProteinMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlphaFoldPrediction" (
    "id" TEXT NOT NULL,
    "pokedexEntryId" TEXT NOT NULL,
    "proteinId" TEXT,
    "alphafoldId" TEXT,
    "modelVersion" TEXT,
    "pdbUrl" TEXT,
    "meanPlddtScore" DOUBLE PRECISION,
    "ptmScore" DOUBLE PRECISION,
    "paeValue" DOUBLE PRECISION,
    "domainCount" INTEGER,
    "secondaryStructure" TEXT,
    "functionalAnnotation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlphaFoldPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfidenceRegion" (
    "id" TEXT NOT NULL,
    "predictionId" TEXT NOT NULL,
    "startResidue" INTEGER NOT NULL,
    "endResidue" INTEGER NOT NULL,
    "confidenceLevel" TEXT NOT NULL,
    "plddtScore" DOUBLE PRECISION NOT NULL,
    "structuralFeature" TEXT,
    "functionalImportance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfidenceRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirulenceFactor" (
    "id" TEXT NOT NULL,
    "pokedexEntryId" TEXT NOT NULL,
    "geneId" TEXT,
    "factorName" TEXT NOT NULL,
    "factorType" TEXT,
    "description" TEXT,
    "virulenceScore" DOUBLE PRECISION,
    "mechanismOfAction" TEXT,
    "targetTissue" TEXT,
    "evidenceLevel" TEXT,
    "dataSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirulenceFactor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MicrobialPokedexEntry_organismId_key" ON "MicrobialPokedexEntry"("organismId");

-- CreateIndex
CREATE UNIQUE INDEX "MicrobialPokedexEntry_pokedexNumber_key" ON "MicrobialPokedexEntry"("pokedexNumber");

-- CreateIndex
CREATE INDEX "GeneProteinMapping_pokedexEntryId_idx" ON "GeneProteinMapping"("pokedexEntryId");

-- CreateIndex
CREATE INDEX "GeneProteinMapping_geneId_idx" ON "GeneProteinMapping"("geneId");

-- CreateIndex
CREATE INDEX "GeneProteinMapping_proteinId_idx" ON "GeneProteinMapping"("proteinId");

-- CreateIndex
CREATE UNIQUE INDEX "AlphaFoldPrediction_alphafoldId_key" ON "AlphaFoldPrediction"("alphafoldId");

-- CreateIndex
CREATE INDEX "AlphaFoldPrediction_pokedexEntryId_idx" ON "AlphaFoldPrediction"("pokedexEntryId");

-- CreateIndex
CREATE INDEX "AlphaFoldPrediction_proteinId_idx" ON "AlphaFoldPrediction"("proteinId");

-- CreateIndex
CREATE INDEX "ConfidenceRegion_predictionId_idx" ON "ConfidenceRegion"("predictionId");

-- CreateIndex
CREATE INDEX "VirulenceFactor_pokedexEntryId_idx" ON "VirulenceFactor"("pokedexEntryId");

-- CreateIndex
CREATE INDEX "VirulenceFactor_geneId_idx" ON "VirulenceFactor"("geneId");

-- AddForeignKey
ALTER TABLE "MicrobialPokedexEntry" ADD CONSTRAINT "MicrobialPokedexEntry_organismId_fkey" FOREIGN KEY ("organismId") REFERENCES "Organism"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneProteinMapping" ADD CONSTRAINT "GeneProteinMapping_pokedexEntryId_fkey" FOREIGN KEY ("pokedexEntryId") REFERENCES "MicrobialPokedexEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneProteinMapping" ADD CONSTRAINT "GeneProteinMapping_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES "Gene"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneProteinMapping" ADD CONSTRAINT "GeneProteinMapping_proteinId_fkey" FOREIGN KEY ("proteinId") REFERENCES "Protein"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlphaFoldPrediction" ADD CONSTRAINT "AlphaFoldPrediction_pokedexEntryId_fkey" FOREIGN KEY ("pokedexEntryId") REFERENCES "MicrobialPokedexEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlphaFoldPrediction" ADD CONSTRAINT "AlphaFoldPrediction_proteinId_fkey" FOREIGN KEY ("proteinId") REFERENCES "Protein"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfidenceRegion" ADD CONSTRAINT "ConfidenceRegion_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "AlphaFoldPrediction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirulenceFactor" ADD CONSTRAINT "VirulenceFactor_pokedexEntryId_fkey" FOREIGN KEY ("pokedexEntryId") REFERENCES "MicrobialPokedexEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirulenceFactor" ADD CONSTRAINT "VirulenceFactor_geneId_fkey" FOREIGN KEY ("geneId") REFERENCES "Gene"("id") ON DELETE SET NULL ON UPDATE CASCADE;
