/*
  Warnings:

  - Added the required column `expiredAt` to the `reset_password` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reset_password" ADD COLUMN     "expiredAt" TIMESTAMP(3) NOT NULL;
