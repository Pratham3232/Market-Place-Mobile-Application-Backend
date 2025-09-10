import { IsInt, IsString, IsOptional, IsEmail, IsDateString, IsBoolean, IsEnum } from 'class-validator';
import { Gender, Pronouns } from '@prisma/client';

export class CreateBusinessDto {
	@IsInt()
	userId: number;

	@IsString()
	businessName: string;

	@IsString()
	businessType: string;

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
	@IsEmail()
	businessEmail?: string;

	@IsOptional()
	@IsEnum(Gender)
	gender?: Gender;

	@IsOptional()
	@IsEnum(Pronouns)
	pronouns?: Pronouns;

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

	@IsOptional()
	@IsString()
	address?: string;

	@IsOptional()
	@IsDateString()
	createdAt?: Date;

	@IsOptional()
	@IsDateString()
	updatedAt?: Date;
}
