import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaModule } from '@app/common';
import { MessagingService } from '../services/messaging.service';
import { SessionRecapService } from '../services/session-recap.service';
import { ProviderActionsController } from '../controllers/provider-actions.controller';
import { BusinessManagementController } from '../controllers/business-management.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    BookingController,
    ProviderActionsController,
    BusinessManagementController
  ],
  providers: [
    BookingService,
    MessagingService,
    SessionRecapService
  ],
  exports: [
    BookingService,
    MessagingService,
    SessionRecapService
  ]
})
export class BookingModule {}
