import { IsInt, IsDateString, IsOptional, IsDecimal, IsEnum, IsNotEmpty, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaymentStatus, BookingStatus } from '@prisma/client';

export class CreateBookingDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  serviceId: number;

  @IsOptional()
  @IsInt()
  providerId?: number;

  @IsOptional()
  @IsInt()
  businessProviderId?: number;

  @IsOptional()
  @IsInt()
  locationProviderId?: number;

  @IsDateString()
  @IsNotEmpty()
  bookingTime: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  durationMinutes: number;

  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  totalPrice: number;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus = PaymentStatus.PENDING;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus = BookingStatus.PENDING;
}
