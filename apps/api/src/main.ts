import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // No global prefix — mobile app calls /lessons, /users, etc. directly
  app.enableCors({ origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*' });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();
