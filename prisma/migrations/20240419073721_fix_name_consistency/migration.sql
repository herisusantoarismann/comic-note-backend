/*
  Warnings:

  - You are about to drop the column `idPengguna` on the `comic` table. All the data in the column will be lost.
  - Added the required column `userId` to the `comic` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "comic" DROP CONSTRAINT "comic_idPengguna_fkey";

-- AlterTable
ALTER TABLE "comic" DROP COLUMN "idPengguna",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "comic" ADD CONSTRAINT "comic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
