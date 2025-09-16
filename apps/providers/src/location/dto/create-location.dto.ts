import { IsInt, IsString, IsOptional, IsEmail, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDataDto } from '../../dto/user-data.dto';

export class CreateLocationDto {
	@IsOptional()
	@IsInt()
	userId?: number;

	@IsOptional()
	@ValidateNested()
	@Type(() => UserDataDto)
	userData?: UserDataDto;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsOptional()
	@IsString()
	contactPerson?: string;

	@IsOptional()
	@IsString()
	website?: string;

	@IsOptional()
	@IsString()
	fullAddress?: string;

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

	@IsOptional()
	@IsDateString()
	createdAt?: Date;

	@IsOptional()
	@IsDateString()
	updatedAt?: Date;
}
