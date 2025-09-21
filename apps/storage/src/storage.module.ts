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
    ClientsModule.register([
      {
        name: 'USER_PROFILE_QUEUE',
        transport: Transport.RMQ,
        options: {
          urls: [rabbitUrl],
          queue: QUEUE_NAMES.USER_PROFILE_IMAGE_UPLOAD,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [StorageController],
  providers: [StorageService, LocationImageProcessor, UserProfileImageProcessor],
})
export class StorageModule {}
