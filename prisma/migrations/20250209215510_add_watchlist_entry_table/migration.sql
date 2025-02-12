-- CreateTable
CREATE TABLE "WatchListEntry" (
    "id" SERIAL NOT NULL,
    "clubber" TEXT NOT NULL,
    "score" TEXT,
    "dateWatched" TIMESTAMP(3),
    "filmId" TEXT NOT NULL,

    CONSTRAINT "WatchListEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WatchListEntry_clubber_filmId_key" ON "WatchListEntry"("clubber", "filmId");

-- AddForeignKey
ALTER TABLE "WatchListEntry" ADD CONSTRAINT "WatchListEntry_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("imdbId") ON DELETE RESTRICT ON UPDATE CASCADE;
