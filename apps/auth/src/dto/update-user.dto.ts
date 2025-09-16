import { UserRole, Gender, Pronouns } from '@prisma/client';
import { 
  IsEmail, 
  IsOptional, 
  IsString, 
  IsEnum, 
  IsArray, 
  IsInt,
  IsBoolean,
  IsPhoneNumber
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsPhoneNumber()
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
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsInt()
  xpiId?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}