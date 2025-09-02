import { IsInt, IsString, IsOptional, IsEmail, IsDateString } from 'class-validator';

export class CreateLocationDto {
	@IsInt()
	userId: number;

	@IsString()
	name: string;

	@IsOptional()
	@IsEmail()
	email?: string;

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

	@IsOptional()
	@IsDateString()
	createdAt?: Date;

	@IsOptional()
	@IsDateString()
	updatedAt?: Date;
}
