import { Module } from '@nestjs/common';
import { SoloService } from './solo.service';
import { SoloController } from './solo.controller';
import { CacheModule, ConfigModule, LoggerModule, PrismaModule } from '@app/common';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    CacheModule,
    ConfigModule
  ],
  controllers: [SoloController],
  providers: [SoloService],
})
export class SoloModule { }
