import { Controller, Post, Body, Get } from '@nestjs/common';
import { LlmOperationsService } from './llm-operations.service';

@Controller('llm')
export class LlmOperationsController {
  constructor(private readonly llmOperationsService: LlmOperationsService) {}

  @Post('activity-prices')
  async getActivityPrice(@Body() request: any): Promise<any> {
    return this.llmOperationsService.getActivityPrice(request);
  }

  @Get('health')
  async healthCheck() {
    return this.llmOperationsService.healthCheck();
  }
}
