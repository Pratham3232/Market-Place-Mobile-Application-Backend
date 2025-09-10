/*
  Warnings:

  - A unique constraint covering the columns `[xpiId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "xpiId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_xpiId_key" ON "User"("xpiId");
