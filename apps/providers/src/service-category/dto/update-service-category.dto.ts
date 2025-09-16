import { IsArray, IsString, IsOptional } from 'class-validator';

export class UpdateServiceCategoryDto {
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    activities?: string[];
}
