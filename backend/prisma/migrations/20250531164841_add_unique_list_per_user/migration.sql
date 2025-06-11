/*
  Warnings:

  - You are about to drop the column `name` on the `List` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `List` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "List" DROP COLUMN "name";

-- CreateIndex
CREATE UNIQUE INDEX "List_userId_key" ON "List"("userId");
