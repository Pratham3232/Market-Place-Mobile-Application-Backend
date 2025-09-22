import { IsInt, IsString, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDataDto } from '../../dto/user-data.dto';

export class CreateLocationDto {
	@IsOptional()
	@IsInt()
	userId?: number;

	@IsOptional()
	@IsString()
	locationName?: string;

	@IsOptional()
	@IsString()
	businessName?: string;

	@IsOptional()
	@IsInt()
	spacesAvailable?: number;

	@IsOptional()
	fullFacilityReserve?: boolean;

	@IsOptional()
	@ValidateNested()
	@Type(() => UserDataDto)
	userData?: UserDataDto;

	// LocationProvider specific fields
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
}
