-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "Pronouns" AS ENUM ('HE_HIM', 'SHE_HER', 'THEY_THEM', 'OTHER');

-- DropIndex
DROP INDEX "Service_category_subCategory_idx";

-- AlterTable
ALTER TABLE "BusinessMember" ADD COLUMN     "gender" "Gender",
ADD COLUMN     "pronouns" "Pronouns";

-- AlterTable
ALTER TABLE "BusinessProvider" ADD COLUMN     "availabilityModification" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bookingApprovalRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "changeCategoryOption" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deliveryOptionChoices" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "priceModificationOption" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pronouns" "Pronouns",
ADD COLUMN     "serviceModification" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "LocationMember" ADD COLUMN     "gender" "Gender",
ADD COLUMN     "pronouns" "Pronouns";

-- AlterTable
ALTER TABLE "LocationProvider" ADD COLUMN     "gender" "Gender",
ADD COLUMN     "pronouns" "Pronouns";

-- AlterTable
ALTER TABLE "LocationService" ADD COLUMN     "serviceCategoryId" INTEGER;

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "gender" "Gender",
ADD COLUMN     "pronouns" "Pronouns";

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "ageMax" INTEGER,
ADD COLUMN     "ageMin" INTEGER,
ADD COLUMN     "serviceCategoryId" INTEGER;

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" SERIAL NOT NULL,
    "categoryName" TEXT NOT NULL,
    "activity" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_categoryName_key" ON "ServiceCategory"("categoryName");

-- CreateIndex
CREATE INDEX "Service_category_subCategory_ageMin_ageMax_idx" ON "Service"("category", "subCategory", "ageMin", "ageMax");

-- AddForeignKey
ALTER TABLE "LocationService" ADD CONSTRAINT "LocationService_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
