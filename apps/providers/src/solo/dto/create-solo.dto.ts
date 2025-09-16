import { IsInt, IsOptional, IsString, IsBoolean, IsDateString, IsNumber, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDataDto } from '../../dto/user-data.dto';

export class CreateSoloDto {
	@IsOptional()
	@IsInt()
	userId?: number;

	@IsOptional()
	@ValidateNested()
	@Type(() => UserDataDto)
	userData?: UserDataDto;

	@IsOptional()
	@IsDateString()
	dateOfBirth?: Date;

	@IsOptional()
	@IsString()
	bio?: string;

	@IsOptional()
	@IsBoolean()
	soloProvider?: boolean;

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

	// Legacy fields for backward compatibility
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	phoneNumber?: string;

	@IsOptional()
	@IsString()
	gender?: string;

	@IsOptional()
	@IsString()
	pronouns?: string;

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
}
