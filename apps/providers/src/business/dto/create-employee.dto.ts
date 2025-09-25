import { IsString, IsPhoneNumber, IsEmail, IsOptional, IsDateString, IsEnum, IsBoolean } from 'class-validator';
import { Gender, Pronouns } from '@prisma/client';

export class CreateEmployeeDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsEnum(Pronouns)
  @IsOptional()
  pronouns?: Pronouns;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  // Service data (optional)
  @IsOptional()
  serviceData?: any;

  // Availability data (optional)
  @IsOptional()
  availabilityData?: any;
}