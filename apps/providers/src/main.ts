import { NestFactory } from '@nestjs/core';
import { ProvidersModule } from './providers.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(ProvidersModule);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService)
  await app.startAllMicroservices();
  await app.listen(configService.get("PROVIDERS_HTTP_PORT") || 3000);
}
bootstrap();
