import { NestFactory } from '@nestjs/core';
import { ProvidersModule } from './providers.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ProvidersModule);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService)
  const config = new DocumentBuilder()
      .setTitle('Providers Service')
      .setDescription('Providers Service for Media uploads and management')
      .setVersion('1.0')
      // .addBearerAuth()
      .addTag('providers')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  
  await app.startAllMicroservices();
  await app.listen(configService.get("PROVIDERS_HTTP_PORT") || 3000);
}
bootstrap();
