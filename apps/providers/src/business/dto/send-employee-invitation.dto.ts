import { IsString, IsPhoneNumber } from 'class-validator';

export class SendEmployeeInvitationDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  name: string;
}