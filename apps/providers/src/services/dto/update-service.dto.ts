import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsEnum, IsDecimal, IsInt } from 'class-validator';
import { ServiceProviderOptions, BookingPreference, LocationBooking } from '@prisma/client';

export class UpdateServiceDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDecimal()
    @IsOptional()
    pricePerHour?: any; // Use string or Decimal type as per your setup

    @IsString()
    @IsOptional()
    category?: string;

  @IsInt()
  @IsOptional()
  ageMin?: number;

  @IsInt()
  @IsOptional()
  ageMax?: number;

    @IsArray()
    @IsEnum(ServiceProviderOptions, { each: true })
    @IsOptional()
    serviceProviderOptions?: ServiceProviderOptions[];

    @IsEnum(BookingPreference)
    @IsOptional()
    bookingPreference?: BookingPreference;

    @IsString()
    @IsOptional()
    subCategory?: string;

    @IsString()
    @IsOptional()
    additionalNotes?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsInt()
    @IsOptional()
    providerId?: number;

  @IsInt()
  @IsOptional()
  businessProviderId?: number;

  @IsInt()
  @IsOptional()
  serviceCategoryId?: number;
  }
  
export class UpdateLocationServiceDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDecimal()
    pricePerHour: any;

    @IsString()
    @IsOptional()
    category?: string;

    @IsEnum(LocationBooking)
    partAvailableForBooking: LocationBooking;

    // Can be enum or string value
    @IsOptional()
    @IsString()
    advanceNoticeTime?: string;

    @IsString()
    @IsOptional()
    parkingInstruction?: string;

    @IsInt()
    @IsOptional()
    sessionSize?: number;

    @IsString()
    @IsOptional()
    equipmentAvailable?: string;

    @IsString()
    @IsOptional()
    generalRules?: string;

    @IsBoolean()
    @IsOptional()
    activeFacilityInsurance?: boolean;

    @IsString()
    @IsOptional()
    accessibilityFeatures?: string;

    @IsBoolean()
    @IsOptional()
    wifiAvailability?: boolean;

    @IsString()
    @IsOptional()
    additionalNotes?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsInt()
    @IsOptional()
    locationProviderId?: number; // relation
}
