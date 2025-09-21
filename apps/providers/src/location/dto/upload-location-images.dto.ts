import { IsEnum, IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { LocationImageType } from '@prisma/client';

export class LocationImageUploadDto {
  @IsEnum(LocationImageType)
  indoorOutdoorType: LocationImageType;
}

export class UploadLocationImagesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationImageUploadDto)
  imageTypes: LocationImageUploadDto[];
}