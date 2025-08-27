import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsPhoneNumber()
    phoneNumber: string;

    // @IsNotEmpty()
    // role: Enumerator<string>;
    // memberType: string;
}