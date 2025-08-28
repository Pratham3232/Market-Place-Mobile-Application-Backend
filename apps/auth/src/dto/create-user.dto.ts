import { UserRole } from '@prisma/client';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsPhoneNumber()
    phoneNumber: string;

    @IsNotEmpty()
    roles: UserRole[];
}

export class RegisterUserDto {
    @IsNotEmpty()
    @IsPhoneNumber()
    phoneNumber: string;

    @IsNotEmpty()
    roles: UserRole;
}