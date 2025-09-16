import { IsString, IsOptional } from 'class-validator';

export class LLMRequestDto {
  @IsString()
  question: string;

  @IsOptional()
  @IsString()
  context?: string; // Additional context for the question
}