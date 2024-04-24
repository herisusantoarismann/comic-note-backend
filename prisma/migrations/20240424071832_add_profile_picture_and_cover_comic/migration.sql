/*
  Warnings:

  - You are about to drop the column `genre` on the `comic` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[coverId]` on the table `comic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profilePicId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "comic" DROP COLUMN "genre",
ADD COLUMN     "cover" TEXT DEFAULT '/default-comic-cover.png',
ADD COLUMN     "coverId" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profilePic" TEXT DEFAULT '/default-profile-pic.png',
ADD COLUMN     "profilePicId" INTEGER;

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ComicToGenre" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ComicToGenre_AB_unique" ON "_ComicToGenre"("A", "B");

-- CreateIndex
CREATE INDEX "_ComicToGenre_B_index" ON "_ComicToGenre"("B");

-- CreateIndex
CREATE UNIQUE INDEX "comic_coverId_key" ON "comic"("coverId");

-- CreateIndex
CREATE UNIQUE INDEX "users_profilePicId_key" ON "users"("profilePicId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profilePicId_fkey" FOREIGN KEY ("profilePicId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comic" ADD CONSTRAINT "comic_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComicToGenre" ADD CONSTRAINT "_ComicToGenre_A_fkey" FOREIGN KEY ("A") REFERENCES "comic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComicToGenre" ADD CONSTRAINT "_ComicToGenre_B_fkey" FOREIGN KEY ("B") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;
