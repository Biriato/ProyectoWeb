/*
  Warnings:

  - The `status` column on the `ListSeries` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('POR_VER', 'MIRANDO', 'VISTA');

-- AlterTable
ALTER TABLE "ListSeries" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'POR_VER';

-- DropEnum
DROP TYPE "WatchStatus";
