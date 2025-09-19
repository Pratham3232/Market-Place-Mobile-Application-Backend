import { IsString, IsOptional, IsEmail, IsBoolean, IsDateString, IsEnum, IsArray, IsInt } from 'class-validator';
import { UserRole, Gender, Pronouns } from '@prisma/client';

export class UserDataDto {
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(Pronouns)
  pronouns?: Pronouns;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsInt()
  xpiId?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}