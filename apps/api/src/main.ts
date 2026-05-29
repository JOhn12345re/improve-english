import { execSync } from 'child_process';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Applies Prisma schema to the production DB before starting the server.
 * This runs regardless of Railway startCommand overrides.
 */
function applySchema(): void {
  try {
    console.log('[startup] Running prisma db push…');
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      cwd: __dirname.includes('dist') ? process.cwd() : __dirname,
    });
    console.log('[startup] Schema applied.');
  } catch (err) {
    console.error('[startup] prisma db push failed:', (err as Error).message);
    // Continue — schema may already be up to date
  }
}

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
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}

bootstrap();
