import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { LocationImageProcessor } from './processors/location-image.processor';
import { UserProfileImageProcessor } from './processors/user-profile-image.processor';
import { QUEUE_NAMES } from '@app/common';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';

const rabbitUrl = process.env.RABBITMQ_HOST as string;

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [StorageController],
  providers: [StorageService, LocationImageProcessor, UserProfileImageProcessor],
})
export class StorageModule {}
