import { IsInt, IsEnum, IsDateString, IsBoolean, IsOptional, IsIn } from 'class-validator';
import { DayOfWeek } from '@prisma/client';

export class CreateAvailabilityDto {
  @IsInt()
  @IsOptional()
  providerId: number;

  @IsInt()
  @IsOptional()
  locationProviderId: number;

  @IsInt()
  @IsOptional()
  businessProviderId: number;

  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
