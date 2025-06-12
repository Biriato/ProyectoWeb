-- DropForeignKey
ALTER TABLE "ListSeries" DROP CONSTRAINT "ListSeries_seriesId_fkey";

-- AddForeignKey
ALTER TABLE "ListSeries" ADD CONSTRAINT "ListSeries_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
