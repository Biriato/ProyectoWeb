-- CreateEnum
CREATE TYPE "WatchStatus" AS ENUM ('watching', 'completed', 'to_watch');

-- AlterTable
ALTER TABLE "ListSeries" ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "status" "WatchStatus" NOT NULL DEFAULT 'to_watch';
