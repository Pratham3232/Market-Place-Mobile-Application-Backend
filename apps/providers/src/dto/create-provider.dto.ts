import { IsOptional, IsString, IsBoolean, IsArray, ValidateNested, IsUrl, IsPhoneNumber, IsEmail } from 'class-validator';

export class CreateProviderDto {
    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsString()
    name: string;

    @IsString()
    @IsEmail()
    email: string;

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
    @IsUrl()
    profileImage?: string;

    @IsOptional()
    @IsBoolean()
    isVerified?: boolean = false;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;
}