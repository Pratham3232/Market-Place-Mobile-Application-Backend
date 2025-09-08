-- CreateEnum
CREATE TYPE "AccessBasedRole" AS ENUM ('SOLO_PROVIDER', 'BUSINESS_PROVIDER', 'LOCATION_PROVIDER', 'USER', 'ADMIN', 'SYSTEM', 'MEMBER', 'SUPER_ADMIN');

-- DropIndex
DROP INDEX "LocationService_category_wifiAvailability_sessionSize_idx";

-- DropIndex
DROP INDEX "LocationService_locationProviderId_isActive_idx";

-- CreateIndex
CREATE INDEX "LocationService_category_sessionSize_locationProviderId_isA_idx" ON "LocationService"("category", "sessionSize", "locationProviderId", "isActive");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
