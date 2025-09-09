import { IsString, IsArray, IsOptional, IsInt } from 'class-validator';

export class CreateServiceCategoryDto {
    @IsString()
    categoryName: string;

    @IsArray()
    @IsString({ each: true })
    activity: string[];

    @IsOptional()
    @IsInt()
    createdBy?: number;
}
