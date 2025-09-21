import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AUTH_QUEUE } from '@app/common';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const rabbitUrl = process.env.RABBITMQ_HOST as string;

  const configService = app.get(ConfigService)
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: AUTH_QUEUE,
      queueOptions: {
        durable: false
      },
    },
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));

  const config = new DocumentBuilder()
        .setTitle('Auth Service')
        .setDescription('Auth Service for Media uploads and management')
        .setVersion('1.0')
        // .addBearerAuth()
        .addTag('auth')
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);

  await app.startAllMicroservices();
  await app.listen(configService.get("AUTH_HTTP_PORT") || 3000);
}

bootstrap();