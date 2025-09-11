import { NestFactory } from '@nestjs/core';
import { StorageModule } from './storage.module';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(StorageModule);
  app.use(json({ limit: '20mb' }));
  app.use(urlencoded({ extended: true, limit: '20mb' }));

  // Swagger configuration

  const config = new DocumentBuilder()
    .setTitle('Storage Service')
    .setDescription('Storage Service for Media uploads and management')
    .setVersion('1.0')
    // .addBearerAuth()
    .addTag('storage')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
