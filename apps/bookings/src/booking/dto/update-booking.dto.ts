import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { IsOptional } from 'class-validator';

// Only allow updating specific fields for security
export class UpdateBookingDto extends PartialType(
  PickType(CreateBookingDto, [
    'bookingTime',
    'durationMinutes',
    'totalPrice',
    'paymentStatus',
    'status'
  ] as const)
) {}
