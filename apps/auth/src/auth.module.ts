import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from './user/user.module';
import { CacheModule, ConfigModule, LoggerModule } from '@app/common';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    CacheModule,
    ConfigModule,
    LoggerModule,
    forwardRef(() => UserModule)
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard]
})

export class AuthModule { }
