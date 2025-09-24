import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';
import { ParentModule } from './parent/parent.module';
import { ChildModule } from './child/child.module';
import { PrismaModule } from '@app/common';

@Module({
  imports: [
    PrismaModule,
    BookingModule,
    PaymentModule,
    ParentModule,
    ChildModule
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService, BookingModule, PaymentModule, ParentModule, ChildModule]
})
export class BookingsModule {}
