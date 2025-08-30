import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { SoloModule } from './solo/solo.module';
import { BusinessModule } from './business/business.module';
import { LocationModule } from './location/location.module';
import { PrismaModule } from '@app/common';

@Module({
  imports: [PrismaModule, SoloModule, BusinessModule, LocationModule],
  controllers: [ProvidersController],
  providers: [ProvidersService],
})
export class ProvidersModule {}
