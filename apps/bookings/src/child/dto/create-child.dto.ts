import { IsNotEmpty, IsString, IsDateString, IsInt } from 'class-validator';

export class CreateChildDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;
}
