/*
  Warnings:

  - The primary key for the `Film` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `Film` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Film` table. All the data in the column will be lost.
  - Added the required column `imdbId` to the `Film` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plot` to the `Film` table without a default value. This is not possible if the table is not empty.
  - Added the required column `poster` to the `Film` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Film` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Film" DROP CONSTRAINT "Film_pkey",
DROP COLUMN "description",
DROP COLUMN "id",
ADD COLUMN     "imdbId" TEXT NOT NULL,
ADD COLUMN     "plot" TEXT NOT NULL,
ADD COLUMN     "poster" TEXT NOT NULL,
ADD COLUMN     "year" TEXT NOT NULL,
ADD CONSTRAINT "Film_pkey" PRIMARY KEY ("imdbId");

-- CreateTable
CREATE TABLE "Meeting" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "filmId" TEXT NOT NULL,
    "host" TEXT NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_date_key" ON "Meeting"("date");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("imdbId") ON DELETE RESTRICT ON UPDATE CASCADE;
