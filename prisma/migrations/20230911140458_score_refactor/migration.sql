/*
  Warnings:

  - You are about to drop the column `scorer` on the `Score` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clubber,meetingId]` on the table `Score` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clubber` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Score_scorer_meetingId_key";

-- AlterTable
ALTER TABLE "Score" DROP COLUMN "scorer",
ADD COLUMN     "clubber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Score_clubber_meetingId_key" ON "Score"("clubber", "meetingId");
