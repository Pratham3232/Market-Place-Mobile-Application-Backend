import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateChildDto } from './create-child.dto';

// Only allow updating specific fields
export class UpdateChildDto extends PartialType(
  PickType(CreateChildDto, ['name', 'dateOfBirth'] as const)
) {}
