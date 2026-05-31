import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

console.log('[BOOT] Starting NestJS application...');
console.log('[BOOT] NODE_ENV:', process.env.NODE_ENV ?? 'not set');
console.log('[BOOT] DATABASE_URL set:', !!process.env.DATABASE_URL);

async function bootstrap() {
  console.log('[BOOT] Creating NestFactory...');
  const app = await NestFactory.create(AppModule);
  console.log('[BOOT] NestFactory created successfully');

  // Healthcheck route via httpAdapter (backup for Railway)
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req: any, res: any) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({ origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*' });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled rejection:', reason);
  process.exit(1);
});

bootstrap().catch((err) => {
  console.error('[FATAL] bootstrap failed:', err);
  process.exit(1);
});
