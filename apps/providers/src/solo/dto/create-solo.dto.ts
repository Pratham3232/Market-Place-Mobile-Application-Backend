import { Gender, Pronouns } from '@prisma/client';
import { IsInt, IsOptional, IsString, IsBoolean, IsDateString, IsNumber, IsEmail, IsEnum } from 'class-validator';

export class CreateSoloDto {
	@IsInt()
	userId: number;

	@IsOptional()
	@IsString()
	name: string;

	@IsOptional()
	@IsEmail()
	email: string;

	@IsOptional()
	@IsDateString()
	dateOfBirth?: Date;

	@IsOptional()
	@IsEnum(Gender)
	gender?: Gender;

	@IsOptional()
	@IsEnum(Pronouns)
	pronouns?: Pronouns;

	@IsOptional()
	@IsString()
	bio?: string;

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
	@IsString()
	profileImage?: string;

	@IsOptional()
	@IsBoolean()
	isVerified?: boolean;

	@IsOptional()
	@IsNumber()
	rating?: number;

	@IsOptional()
	@IsInt()
	totalReviews?: number;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@IsOptional()
	@IsInt()
	businessProviderId?: number;
}
