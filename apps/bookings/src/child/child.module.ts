import { Module } from '@nestjs/common';
import { ChildService } from './child.service';
import { ChildController } from './child.controller';
import { PrismaModule } from '@app/common';

@Module({
  imports: [PrismaModule],
  controllers: [ChildController],
  providers: [ChildService],
  exports: [ChildService]
})
export class ChildModule {}
