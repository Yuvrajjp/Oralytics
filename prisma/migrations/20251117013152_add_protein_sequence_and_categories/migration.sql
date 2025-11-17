-- AlterTable
ALTER TABLE "Protein" ADD COLUMN     "functionClass" TEXT,
ADD COLUMN     "predictedLocalization" TEXT,
ADD COLUMN     "sequence" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "structureClass" TEXT;
