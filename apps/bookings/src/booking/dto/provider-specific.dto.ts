import { IsOptional, IsString, IsInt, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { BookingStatus } from '@prisma/client';

export class ProviderSessionQueryDto {
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
  @IsString()
  sortBy?: 'bookingTime' | 'createdAt' = 'bookingTime';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}

export class MessageToParentDto {
  @IsInt()
  senderId: number; // Provider user ID

  @IsInt()
  receiverId: number; // Parent user ID

  @IsString()
  message: string;

  @IsOptional()
  @IsInt()
  bookingId?: number; // Related booking if any
}

export class SessionRecapDto {
  @IsInt()
  bookingId: number;

  @IsString()
  notes: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  rating?: number; // 1-5 rating

  @IsOptional()
  @IsString()
  recommendations?: string;

  @IsOptional()
  @IsString()
  nextSteps?: string;
}