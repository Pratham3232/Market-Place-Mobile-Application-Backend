import { Module } from '@nestjs/common';
import { ParentService } from './parent.service';
import { ParentController } from './parent.controller';
import { PrismaModule } from '@app/common';

@Module({
  imports: [PrismaModule],
  controllers: [ParentController],
  providers: [ParentService],
  exports: [ParentService]
})
export class ParentModule {}
