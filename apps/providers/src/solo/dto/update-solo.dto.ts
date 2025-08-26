import { PartialType } from '@nestjs/mapped-types';
import { CreateSoloDto } from './create-solo.dto';

export class UpdateSoloDto extends PartialType(CreateSoloDto) {}
