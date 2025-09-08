import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule, AUTH_SERVICE, AUTH_QUEUE } from '@app/common';
import { AuthModule } from '../auth.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: AUTH_QUEUE,
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})

export class UserModule { }
