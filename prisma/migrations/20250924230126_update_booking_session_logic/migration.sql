/*
  Warnings:

  - Added the required column `recapStatus` to the `BookingSession` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "recapStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "BookingSession" ADD COLUMN     "recapStatus" "recapStatus" NOT NULL;
