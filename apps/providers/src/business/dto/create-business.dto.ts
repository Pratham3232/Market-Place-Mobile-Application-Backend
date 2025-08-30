import { IsInt, IsString, IsOptional, IsEmail, IsDateString, IsBoolean } from 'class-validator';

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
