
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE, AUTH_QUEUE } from '@app/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
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
    ]),
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
})
export class BusinessModule {}
