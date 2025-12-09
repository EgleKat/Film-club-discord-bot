-- CreateTable
CREATE TABLE "FilmComment" (
    "id" SERIAL NOT NULL,
    "clubber" TEXT NOT NULL,
    "meetingId" INTEGER NOT NULL,
    "recommendFriend" BOOLEAN NOT NULL DEFAULT false,
    "watchAgain" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FilmComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "userMeetingCommentIdentifier" ON "FilmComment"("clubber", "meetingId");

-- AddForeignKey
ALTER TABLE "FilmComment" ADD CONSTRAINT "FilmComment_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
