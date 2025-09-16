import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { LlmOperationsModule } from './llm-operations.module';

async function bootstrap() {
  const app = await NestFactory.create(LlmOperationsModule);
  
  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS for cross-origin requests
  app.enableCors();

  const port = process.env.LLM_OPERATIONS_PORT || 3003;
  await app.listen(port);
  
  console.log(`LLM Operations microservice is running on port ${port}`);
}
bootstrap();
