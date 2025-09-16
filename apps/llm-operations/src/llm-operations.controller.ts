import { Controller, Post, Body, Get } from '@nestjs/common';
import { LlmOperationsService } from './llm-operations.service';
import { LLMRequestDto } from './dto/llm-request.dto';
import { LLMResponseDto } from './dto/llm-response.dto';

@Controller('llm')
export class LlmOperationsController {
  constructor(private readonly llmOperationsService: LlmOperationsService) {}

  @Post('ask')
  async askQuestion(@Body() request: LLMRequestDto): Promise<LLMResponseDto> {
    return this.llmOperationsService.askQuestion(request);
  }

  @Get('health')
  async healthCheck() {
    return this.llmOperationsService.healthCheck();
  }
}
