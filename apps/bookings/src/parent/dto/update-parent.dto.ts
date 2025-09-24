import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateParentDto } from './create-parent.dto';

// Only allow updating specific fields
export class UpdateParentDto extends PartialType(
  PickType(CreateParentDto, ['name', 'email', 'phoneNumber'] as const)
) {}
