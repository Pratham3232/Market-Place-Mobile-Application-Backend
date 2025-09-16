import { IsInt, IsString, IsOptional, IsEmail, IsDateString, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDataDto } from '../../dto/user-data.dto';

export class CreateBusinessDto {
	@IsOptional()
	@IsInt()
	userId?: number;

	@IsOptional()
	@ValidateNested()
	@Type(() => UserDataDto)
	userData?: UserDataDto;

	@IsString()
	businessName: string;

	@IsString()
	businessType: string;

	@IsOptional()
	@IsEmail()
	businessEmail?: string;

	@IsOptional()
	@IsBoolean()
	availabilityModification?: boolean;

	@IsOptional()
	@IsBoolean()
	serviceModification?: boolean;

	@IsOptional()
	@IsBoolean()
	deliveryOptionChoices?: boolean;

	@IsOptional()
	@IsBoolean()
	bookingApprovalRequired?: boolean;

	@IsOptional()
	@IsBoolean()
	changeCategoryOption?: boolean;

	@IsOptional()
	@IsBoolean()
	priceModificationOption?: boolean;

	@IsOptional()
	@IsString()
	adminName?: string;

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
	@IsBoolean()
	isActive?: boolean;

	@IsOptional()
	@IsDateString()
	createdAt?: Date;

	@IsOptional()
	@IsDateString()
	updatedAt?: Date;
}
