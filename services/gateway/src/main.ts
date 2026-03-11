import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { winstonLoggerFactory } from './logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLoggerFactory,
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger API docs
  const config = new DocumentBuilder()
    .setTitle('OmniDynamic Gateway API')
    .setDescription('API Gateway / BFF for OmniDynamic Engine')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.GATEWAY_PORT || 3001;
  await app.listen(port);
  console.log(`OmniDynamic Gateway running on port ${port}`);
}

bootstrap();
