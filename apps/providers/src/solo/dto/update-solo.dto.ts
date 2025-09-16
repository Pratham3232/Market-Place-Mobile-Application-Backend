import { PartialType } from '@nestjs/mapped-types';
import { CreateSoloDto } from './create-solo.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDataDto } from '../../dto/user-data.dto';

export class UpdateSoloDto extends PartialType(CreateSoloDto) {
  @IsOptional()
  @ValidateNested()
  @Type(() => UserDataDto)
  userData?: UserDataDto;
}
