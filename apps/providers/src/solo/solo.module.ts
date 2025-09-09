import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE, AUTH_QUEUE } from '@app/common';
import { SoloService } from './solo.service';
import { SoloController } from './solo.controller';
import { CacheModule, ConfigModule, LoggerModule, PrismaModule } from '@app/common';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    CacheModule,
    ConfigModule,
    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://stgrabbitmq:5672'],
          queue: AUTH_QUEUE,
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [SoloController],
  providers: [SoloService],
})
export class SoloModule { }
