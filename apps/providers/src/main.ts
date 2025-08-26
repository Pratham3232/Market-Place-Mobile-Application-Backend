import { NestFactory } from '@nestjs/core';
import { ProvidersModule } from './providers.module';

async function bootstrap() {
  const app = await NestFactory.create(ProvidersModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
