import { UserRole } from '@prisma/client';
import { IsEmail, isNotEmpty, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsPhoneNumber()
    phoneNumber: string;

    @IsNotEmpty()
    role: UserRole;
}