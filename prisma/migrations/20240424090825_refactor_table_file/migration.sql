/*
  Warnings:

  - You are about to drop the column `coverId` on the `comic` table. All the data in the column will be lost.
  - You are about to drop the column `idUser` on the `reset_password` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `reset_password` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "comic" DROP CONSTRAINT "comic_coverId_fkey";

-- DropForeignKey
ALTER TABLE "reset_password" DROP CONSTRAINT "reset_password_idUser_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_profilePicId_fkey";

-- DropIndex
DROP INDEX "comic_coverId_key";

-- DropIndex
DROP INDEX "users_profilePicId_key";

-- AlterTable
ALTER TABLE "comic" DROP COLUMN "coverId";

-- AlterTable
ALTER TABLE "reset_password" DROP COLUMN "idUser",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "profilePicId";

-- DropTable
DROP TABLE "File";

-- CreateTable
CREATE TABLE "profile_pic_files" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "profile_pic_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cover_files" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comicId" INTEGER,

    CONSTRAINT "cover_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_pic_files_userId_key" ON "profile_pic_files"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cover_files_comicId_key" ON "cover_files"("comicId");

-- AddForeignKey
ALTER TABLE "profile_pic_files" ADD CONSTRAINT "profile_pic_files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cover_files" ADD CONSTRAINT "cover_files_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "comic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_password" ADD CONSTRAINT "reset_password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
