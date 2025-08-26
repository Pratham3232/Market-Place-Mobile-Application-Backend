/*
  Warnings:

  - You are about to drop the column `locations` on the `Provider` table. All the data in the column will be lost.
  - Added the required column `serviceLocations` to the `Provider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "locations",
ADD COLUMN     "serviceLocations" TEXT NOT NULL;
