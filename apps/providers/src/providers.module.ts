import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { SoloModule } from './solo/solo.module';
import { BusinessModule } from './business/business.module';
import { LocationModule } from './location/location.module';
import { PrismaModule } from '@app/common';
import { ServicesModule } from './services/services.module';
import { ServiceCategoryModule } from './service-category/service-category.module';

@Module({
  imports: [PrismaModule, SoloModule, BusinessModule, LocationModule, ServicesModule, ServiceCategoryModule],
  controllers: [ProvidersController],
  providers: [ProvidersService],
})
export class ProvidersModule {}
