import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from './user/user.module';
import { CacheModule, ConfigModule, LoggerModule, AUTH_SERVICE, AUTH_QUEUE } from '@app/common';

@Module({
  imports: [
    CacheModule,
    ConfigModule,
    LoggerModule,
    forwardRef(() => UserModule),
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
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})

export class AuthModule { }
