/*
  Warnings:

  - Added the required column `status` to the `Series` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Series" ADD COLUMN     "averageScore" DOUBLE PRECISION,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "episodes" INTEGER,
ADD COLUMN     "genres" TEXT[],
ADD COLUMN     "source" TEXT,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "studio" TEXT,
ALTER COLUMN "year" SET DATA TYPE TEXT;
