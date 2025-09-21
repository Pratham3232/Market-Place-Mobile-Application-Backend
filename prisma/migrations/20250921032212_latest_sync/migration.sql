-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'MEMBER', 'SOLO_PROVIDER', 'BUSINESS_PROVIDER', 'BUSINESS_EMPLOYEE', 'LOCATION_PROVIDER');

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

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "Pronouns" AS ENUM ('HE_HIM', 'SHE_HER', 'THEY_THEM', 'OTHER');

-- CreateEnum
CREATE TYPE "LocationImageType" AS ENUM ('INDOOR', 'OUTDOOR');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "roles" "UserRole"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "xpiId" INTEGER,
    "name" TEXT,
    "email" TEXT,
    "gender" "Gender",
    "pronouns" "Pronouns",
    "dateOfBirth" TIMESTAMP(3),
    "profileImage" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
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
    "businessEmail" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "availabilityModification" BOOLEAN NOT NULL DEFAULT false,
    "serviceModification" BOOLEAN NOT NULL DEFAULT false,
    "deliveryOptionChoices" BOOLEAN NOT NULL DEFAULT false,
    "bookingApprovalRequired" BOOLEAN NOT NULL DEFAULT false,
    "changeCategoryOption" BOOLEAN NOT NULL DEFAULT false,
    "priceModificationOption" BOOLEAN NOT NULL DEFAULT false,
    "adminName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkExpiryAndUsage" (
    "id" SERIAL NOT NULL,
    "businessProviderId" INTEGER NOT NULL,
    "employeeUsed" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "limitConsumed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkExpiryAndUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessMember" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "role" "BusinesMemberRole" NOT NULL,
    "gender" "Gender",
    "pronouns" "Pronouns",
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
    "phone" TEXT,
    "contactPerson" TEXT,
    "website" TEXT,
    "fullAddress" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationImage" (
    "id" SERIAL NOT NULL,
    "locationProviderId" INTEGER NOT NULL,
    "bucket" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "indoorOutdoorType" "LocationImageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationImage_pkey" PRIMARY KEY ("id")
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
    "serviceCategoryId" INTEGER,

    CONSTRAINT "LocationService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationMember" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "gender" "Gender",
    "pronouns" "Pronouns",
    "role" "BusinesMemberRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessProviderId" INTEGER,

    CONSTRAINT "LocationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "providerId" INTEGER,
    "businessProviderId" INTEGER,
    "locationProviderId" INTEGER,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "question" TEXT,
    "content" TEXT NOT NULL,
    "audioUrl" TEXT,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" SERIAL NOT NULL,
    "categoryName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "serviceCategoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "pricePerHour" DECIMAL(10,2) NOT NULL,
    "category" TEXT DEFAULT '',
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "serviceProviderOptions" "ServiceProviderOptions"[],
    "bookingPreference" "BookingPreference",
    "subCategory" TEXT,
    "additionalNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "providerId" INTEGER,
    "serviceCategoryId" INTEGER,
    "activityId" INTEGER,
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
CREATE UNIQUE INDEX "User_xpiId_key" ON "User"("xpiId");

-- CreateIndex
CREATE INDEX "User_phoneNumber_id_idx" ON "User"("phoneNumber", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_userId_key" ON "Provider"("userId");

-- CreateIndex
CREATE INDEX "Provider_isActive_isVerified_soloProvider_businessProviderI_idx" ON "Provider"("isActive", "isVerified", "soloProvider", "businessProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProvider_userId_key" ON "BusinessProvider"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkExpiryAndUsage_token_key" ON "LinkExpiryAndUsage"("token");

-- CreateIndex
CREATE INDEX "LinkExpiryAndUsage_id_businessProviderId_token_expiresAt_idx" ON "LinkExpiryAndUsage"("id", "businessProviderId", "token", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessMember_email_key" ON "BusinessMember"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessMember_phoneNumber_key" ON "BusinessMember"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LocationProvider_userId_key" ON "LocationProvider"("userId");

-- CreateIndex
CREATE INDEX "LocationImage_locationProviderId_bucket_idx" ON "LocationImage"("locationProviderId", "bucket");

-- CreateIndex
CREATE INDEX "LocationService_category_wifiAvailability_sessionSize_idx" ON "LocationService"("category", "wifiAvailability", "sessionSize");

-- CreateIndex
CREATE INDEX "LocationService_locationProviderId_isActive_idx" ON "LocationService"("locationProviderId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LocationMember_email_key" ON "LocationMember"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LocationMember_phoneNumber_key" ON "LocationMember"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_sessionId_key" ON "Conversation"("sessionId");

-- CreateIndex
CREATE INDEX "Conversation_sessionId_idx" ON "Conversation"("sessionId");

-- CreateIndex
CREATE INDEX "Conversation_providerId_businessProviderId_locationProvider_idx" ON "Conversation"("providerId", "businessProviderId", "locationProviderId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_categoryName_key" ON "ServiceCategory"("categoryName");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_serviceCategoryId_name_key" ON "Activity"("serviceCategoryId", "name");

-- CreateIndex
CREATE INDEX "Service_serviceCategoryId_activityId_ageMin_ageMax_provider_idx" ON "Service"("serviceCategoryId", "activityId", "ageMin", "ageMax", "providerId", "businessProviderId", "isActive");

-- CreateIndex
CREATE INDEX "Availability_providerId_locationProviderId_businessProvider_idx" ON "Availability"("providerId", "locationProviderId", "businessProviderId", "dayOfWeek", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_providerId_locationProviderId_businessProvider_key" ON "Availability"("providerId", "locationProviderId", "businessProviderId", "dayOfWeek", "startTime", "endTime");

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_businessProviderId_fkey" FOREIGN KEY ("businessProviderId") REFERENCES "BusinessProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProvider" ADD CONSTRAINT "BusinessProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkExpiryAndUsage" ADD CONSTRAINT "LinkExpiryAndUsage_businessProviderId_fkey" FOREIGN KEY ("businessProviderId") REFERENCES "BusinessProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessMember" ADD CONSTRAINT "BusinessMember_businessProviderId_fkey" FOREIGN KEY ("businessProviderId") REFERENCES "BusinessProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationProvider" ADD CONSTRAINT "LocationProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationImage" ADD CONSTRAINT "LocationImage_locationProviderId_fkey" FOREIGN KEY ("locationProviderId") REFERENCES "LocationProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationService" ADD CONSTRAINT "LocationService_locationProviderId_fkey" FOREIGN KEY ("locationProviderId") REFERENCES "LocationProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationService" ADD CONSTRAINT "LocationService_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationMember" ADD CONSTRAINT "LocationMember_businessProviderId_fkey" FOREIGN KEY ("businessProviderId") REFERENCES "LocationProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_businessProviderId_fkey" FOREIGN KEY ("businessProviderId") REFERENCES "BusinessProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_locationProviderId_fkey" FOREIGN KEY ("locationProviderId") REFERENCES "LocationProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_businessProviderId_fkey" FOREIGN KEY ("businessProviderId") REFERENCES "BusinessProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_locationProviderId_fkey" FOREIGN KEY ("locationProviderId") REFERENCES "LocationProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_businessProviderId_fkey" FOREIGN KEY ("businessProviderId") REFERENCES "BusinessProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
