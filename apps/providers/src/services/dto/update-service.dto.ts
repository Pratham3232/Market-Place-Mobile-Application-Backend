import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsEnum, IsDecimal, IsInt } from 'class-validator';
import { ServiceProviderOptions, BookingPreference } from '@prisma/client';

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
}
