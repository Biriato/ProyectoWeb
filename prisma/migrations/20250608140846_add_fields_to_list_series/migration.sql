-- AlterTable
ALTER TABLE "ListSeries" ADD COLUMN     "currentEpisode" INTEGER,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3);
