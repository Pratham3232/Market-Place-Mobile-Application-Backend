import { IsInt, IsEnum, IsDateString, IsBoolean, IsOptional } from 'class-validator';
import { DayOfWeek } from '@prisma/client';

export class CreateAvailabilityDto {
  @IsInt()
  providerId: number;

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
