import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';

// Only allow updating payment status for security
export class UpdatePaymentDto extends PartialType(
  PickType(CreatePaymentDto, ['paymentStatus'] as const)
) {}
