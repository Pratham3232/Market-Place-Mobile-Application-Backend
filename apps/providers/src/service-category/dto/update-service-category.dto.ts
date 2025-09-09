import { IsArray, IsString } from 'class-validator';

export class UpdateServiceCategoryDto {
    @IsArray()
    @IsString({ each: true })
    activity: string[];
}
