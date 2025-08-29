import { IsInt, IsString, IsOptional, IsEmail, IsDateString } from 'class-validator';

export class CreateLocationDto {
	@IsInt()
	userId: number;

	@IsString()
	businessName: string;

	@IsOptional()
	@IsEmail()
	businessEmail?: string;

	@IsOptional()
	@IsString()
	businessPhone?: string;

	@IsOptional()
	@IsString()
	website?: string;

	@IsOptional()
	@IsString()
	taxId?: string;

	@IsOptional()
	@IsDateString()
	createdAt?: Date;

	@IsOptional()
	@IsDateString()
	updatedAt?: Date;
}
