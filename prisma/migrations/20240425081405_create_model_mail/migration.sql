/*
  Warnings:

  - You are about to drop the `favotite_comic` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "favotite_comic" DROP CONSTRAINT "favotite_comic_comicId_fkey";

-- DropForeignKey
ALTER TABLE "favotite_comic" DROP CONSTRAINT "favotite_comic_userId_fkey";

-- DropTable
DROP TABLE "favotite_comic";

-- CreateTable
CREATE TABLE "favorite_comic" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "comicId" INTEGER NOT NULL,

    CONSTRAINT "favorite_comic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail" (
    "id" SERIAL NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "favorite_comic" ADD CONSTRAINT "favorite_comic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_comic" ADD CONSTRAINT "favorite_comic_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "comic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
