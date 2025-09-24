import { IsNotEmpty, IsString, IsDecimal, IsInt, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  id: string; // Payment ID from payment provider

  @IsInt()
  @IsNotEmpty()
  bookingId: number;

  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus = PaymentStatus.PENDING;

  @IsString()
  @IsNotEmpty()
  transactionId: string;
}
