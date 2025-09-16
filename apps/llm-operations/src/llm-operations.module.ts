import { Module } from '@nestjs/common';
import { LlmOperationsController } from './llm-operations.controller';
import { LlmOperationsService } from './llm-operations.service';

@Module({
  imports: [],
  controllers: [LlmOperationsController],
  providers: [LlmOperationsService],
  exports: [LlmOperationsService],
})
export class LlmOperationsModule {}
