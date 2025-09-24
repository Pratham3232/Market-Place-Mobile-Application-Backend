import { IsInt, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

// For session recaps (we'll store this as additional data)
export class CreateSessionRecapDto {
  @IsInt()
  bookingId: number;

  @IsString()
  notes: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  rating?: number; // 1-5

  @IsOptional()
  @IsString()
  recommendations?: string;

  @IsOptional()
  @IsString()
  nextSteps?: string;

  @IsOptional()
  @IsString()
  attachments?: string; // JSON string of file URLs
}

// For notifications
export enum NotificationType {
  BOOKING_REQUEST = 'BOOKING_REQUEST',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  SESSION_REMINDER = 'SESSION_REMINDER',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  RECAP_REQUIRED = 'RECAP_REQUIRED'
}

export class CreateNotificationDto {
  @IsInt()
  userId: number; // Recipient

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsInt()
  relatedBookingId?: number;

  @IsOptional()
  @IsString()
  metadata?: string; // JSON string for additional data
}

export class NotificationQueryDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  userId?: number;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}