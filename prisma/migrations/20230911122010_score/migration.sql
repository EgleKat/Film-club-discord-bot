-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "scorer" TEXT NOT NULL,
    "score" TEXT NOT NULL,
    "meetingId" INTEGER NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
