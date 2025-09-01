import { IsInt, IsOptional, IsString, IsBoolean, IsDateString, IsNumber, IsEmail } from 'class-validator';

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
