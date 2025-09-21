
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE, AUTH_QUEUE, STORAGE_SERVICE, QUEUE_NAMES } from '@app/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { PrismaModule } from '../../../../libs/common/src/prisma/prisma.module';
const rabbitUrl = process.env.RABBITMQ_HOST as string;

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [rabbitUrl],
          queue: AUTH_QUEUE,
          queueOptions: { durable: false },
        },
      },
      {
        name: STORAGE_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [rabbitUrl],
          queue: QUEUE_NAMES.LOCATION_IMAGE_UPLOAD,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
