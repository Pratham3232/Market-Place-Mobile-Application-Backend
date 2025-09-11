import { NestFactory } from '@nestjs/core';
import { StorageModule } from './storage.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(StorageModule);
  app.use(json({ limit: '20mb' }));
  app.use(urlencoded({ extended: true, limit: '20mb' }));
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
