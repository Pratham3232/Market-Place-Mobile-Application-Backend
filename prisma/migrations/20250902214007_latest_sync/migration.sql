-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'MEMBER', 'SOLO_PROVIDER', 'BUSINESS_PROVIDER', 'LOCATION_PROVIDER');

-- CreateEnum
CREATE TYPE "BusinesMemberRole" AS ENUM ('ADMIN', 'MANAGER', 'READ');

-- CreateEnum
CREATE TYPE "ServiceProviderOptions" AS ENUM ('AT_CUSTOMER_LOCATION', 'AT_PROVIDER_LOCATION', 'VIRTUAL', 'LOCAL_PARTNER_LOCATION');

-- CreateEnum
CREATE TYPE "BookingPreference" AS ENUM ('INSTANT_BOOKING', 'REVIEW_REQUEST');

-- CreateEnum
CREATE TYPE "LocationBooking" AS ENUM ('PART_OF_SPACE', 'FULL_FACILITY');

-- CreateEnum
CREATE TYPE "BookingNotice" AS ENUM ('NONE', 'ONE_HOUR', 'EIGHT_HOURS', 'TWENTY_FOUR_HOURS');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "roles" "UserRole"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "bio" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "profileImage" TEXT,
    "soloProvider" BOOLEAN DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessProviderId" INTEGER,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProvider" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "businessEmail" TEXT,
    "adminName" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessMember" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "role" "BusinesMemberRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessProviderId" INTEGER,

    CONSTRAINT "BusinessMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationProvider" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "contactPerson" TEXT,
    "website" TEXT,
    "taxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationService" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "pricePerHour" DECIMAL(10,2) NOT NULL,
    "category" TEXT DEFAULT '',
    "partAvailableForBooking" "LocationBooking" NOT NULL,
    "advanceNoticeTime" TEXT,
    "parkingInstruction" TEXT DEFAULT '',
    "sessionSize" INTEGER,
    "equipmentAvailable" TEXT DEFAULT '',
    "generalRules" TEXT DEFAULT '',
    "activeFacilityInsurance" BOOLEAN NOT NULL DEFAULT false,
    "accessibilityFeatures" TEXT DEFAULT '',
    "wifiAvailability" BOOLEAN NOT NULL DEFAULT false,
    "additionalNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "locationProviderId" INTEGER,

    CONSTRAINT "LocationService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationMember" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "role" "BusinesMemberRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessProviderId" INTEGER,

    CONSTRAINT "LocationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "pricePerHour" DECIMAL(10,2) NOT NULL,
    "category" TEXT DEFAULT '',
    "serviceProviderOptions" "ServiceProviderOptions"[],
    "bookingPreference" "BookingPreference",
    "subCategory" TEXT,
    "additionalNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "providerId" INTEGER,
    "businessProviderId" INTEGER,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER,
    "locationProviderId" INTEGER,
    "businessProviderId" INTEGER,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_userId_key" ON "Provider"("userId");

-- CreateIndex
CREATE INDEX "Provider_city_state_idx" ON "Provider"("city", "state");

-- CreateIndex
CREATE INDEX "Provider_isActive_isVerified_idx" ON "Provider"("isActive", "isVerified");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProvider_userId_key" ON "BusinessProvider"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessMember_email_key" ON "BusinessMember"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessMember_phoneNumber_key" ON "BusinessMember"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LocationProvider_userId_key" ON "LocationProvider"("userId");

-- CreateIndex
CREATE INDEX "LocationService_category_wifiAvailability_sessionSize_idx" ON "LocationService"("category", "wifiAvailability", "sessionSize");

-- CreateIndex
CREATE INDEX "LocationService_locationProviderId_isActive_idx" ON "LocationService"("locationProviderId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LocationMember_email_key" ON "LocationMember"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LocationMember_phoneNumber_key" ON "LocationMember"("phoneNumber");

-- CreateIndex
CREATE INDEX "Service_category_subCategory_idx" ON "Service"("category", "subCategory");

-- CreateIndex
CREATE INDEX "Service_providerId_businessProviderId_isActive_idx" ON "Service"("providerId", "businessProviderId", "isActive");

-- CreateIndex
CREATE INDEX "Availability_providerId_locationProviderId_businessProvider_idx" ON "Availability"("providerId", "locationProviderId", "businessProviderId", "dayOfWeek", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_providerId_locationProviderId_businessProvider_key" ON "Availability"("providerId", "locationProviderId", "businessProviderId", "dayOfWeek", "startTime", "endTime");

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_businessProviderId_fkey" FOREIGN KEY ("businessProviderId") REFERENCES "BusinessProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProvider" ADD CONSTRAINT "BusinessProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessMember" ADD CONSTRAINT "BusinessMember_businessProviderId_fkey" FOREIGN KEY ("businessProviderId") REFERENCES "BusinessProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationProvider" ADD CONSTRAINT "LocationProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationService" ADD CONSTRAINT "LocationService_locationProviderId_fkey" FOREIGN KEY ("locationProviderId") REFERENCES "LocationProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationMember" ADD CONSTRAINT "LocationMember_businessProviderId_fkey" FOREIGN KEY ("businessProviderId") REFERENCES "LocationProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_businessProviderId_fkey" FOREIGN KEY ("businessProviderId") REFERENCES "BusinessProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_locationProviderId_fkey" FOREIGN KEY ("locationProviderId") REFERENCES "LocationProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_businessProviderId_fkey" FOREIGN KEY ("businessProviderId") REFERENCES "BusinessProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
