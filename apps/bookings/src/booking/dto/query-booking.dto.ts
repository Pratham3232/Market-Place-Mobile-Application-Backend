import { IsOptional, IsInt, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaymentStatus, BookingStatus } from '@prisma/client';

export class QueryBookingDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  userId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  serviceId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  providerId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  businessProviderId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  locationProviderId?: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}