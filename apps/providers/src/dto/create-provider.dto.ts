import { IsOptional, IsString, IsBoolean, IsNumber, IsInt } from 'class-validator';

export class CreateProviderDto {
    @IsInt()
    userId: number;

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