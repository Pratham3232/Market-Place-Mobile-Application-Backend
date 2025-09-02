import { IsInt, IsEnum, IsDateString, IsBoolean, IsOptional } from 'class-validator';
import { DayOfWeek } from '@prisma/client';

export class UpdateAvailabilityDto {
  @IsInt()
  @IsOptional()
  providerId?: number;

  @IsInt()
  @IsOptional()
  locationProviderId?: number;

  @IsInt()
  @IsOptional()
  businessProviderId?: number;

  @IsEnum(DayOfWeek)
  @IsOptional()
  dayOfWeek?: DayOfWeek;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
