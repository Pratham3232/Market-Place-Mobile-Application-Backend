import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE, AUTH_QUEUE } from '@app/common';
import { SoloService } from './solo.service';
import { SoloController } from './solo.controller';
import { CacheModule, ConfigModule, LoggerModule, PrismaModule } from '@app/common';
const rabbitUrl = process.env.RABBITMQ_HOST as string;


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
          urls: [rabbitUrl],
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
