export class LLMResponseDto {
  success: boolean;
  data?: {
    answer: string;
    question: string;
    processingTime: number; // in milliseconds
  };
  error?: string;
  message?: string;
}