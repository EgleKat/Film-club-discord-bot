/*
  Warnings:

  - A unique constraint covering the columns `[scorer,meetingId]` on the table `Score` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Score_scorer_meetingId_key" ON "Score"("scorer", "meetingId");
