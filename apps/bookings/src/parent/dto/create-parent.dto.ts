import { IsNotEmpty, IsString, IsEmail, IsPhoneNumber, IsInt } from 'class-validator';

export class CreateParentDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
