import { IsInt, IsOptional, IsString, IsBoolean, IsNumber, ValidateNested } from 'class-validator';
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

	// Provider specific fields (now in Provider model)
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
	@IsNumber()
	latitude?: number;

	@IsOptional()
	@IsNumber()
	longitude?: number;

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
}
