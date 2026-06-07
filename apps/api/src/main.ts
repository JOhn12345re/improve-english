import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// deploy-13
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

  httpAdapter.get('/privacy', (_req: any, res: any) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>EnglishFlow - Privacy Policy</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2937;line-height:1.7;padding:24px;max-width:720px;margin:0 auto;background:#fff}
h1{font-size:28px;color:#1e1b4b;margin-bottom:4px}
h2{font-size:18px;color:#1e1b4b;margin-top:28px;margin-bottom:8px}
p,li{font-size:15px;margin-bottom:8px}
ul{padding-left:20px}
.updated{font-size:13px;color:#9ca3af;margin-bottom:24px}
.contact{background:#eef2ff;border-radius:12px;padding:16px;margin-top:24px}
</style>
</head>
<body>
<h1>EnglishFlow</h1>
<h2>Privacy Policy</h2>
<p class="updated">Last updated: June 2, 2026</p>

<h2>1. Introduction</h2>
<p>EnglishFlow ("we", "our", "the app") is an English learning application developed for French-speaking learners. We respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information.</p>

<h2>2. Data We Collect</h2>
<ul>
<li><strong>Profile data:</strong> First name, last name, native language, English level, and learning goals. This data is stored locally on your device.</li>
<li><strong>Learning progress:</strong> Lesson scores, vocabulary mastery, XP, and streak data. Stored locally on your device.</li>
<li><strong>No account required:</strong> The app works without creating an account. We do not collect email addresses or passwords unless you choose to create an account.</li>
</ul>

<h2>3. How We Use Your Data</h2>
<p>Your data is used solely to personalize your learning experience: adapting lesson difficulty, tracking your progress, and scheduling vocabulary reviews. We do not sell, share, or transfer your personal data to third parties for marketing or advertising purposes.</p>

<h2>4. Data Storage &amp; Security</h2>
<p>All personal data is stored locally on your device using secure storage. If you create an account, anonymized progress data may be synced to our servers (PostgreSQL database hosted on Railway in the United States) to enable cross-device access. Data is transmitted using HTTPS encryption.</p>

<h2>5. Third-Party Services</h2>
<ul>
<li><strong>Expo / EAS:</strong> Used for app distribution and over-the-air updates. Subject to <a href="https://expo.dev/privacy">Expo's privacy policy</a>.</li>
<li><strong>AI explanations:</strong> When you request an AI explanation for an exercise, your answer and the exercise content are sent to our server for processing. No personal identifying data is included in these requests.</li>
</ul>

<h2>6. Your Rights (GDPR / RGPD)</h2>
<p>Under the General Data Protection Regulation (GDPR), you have the right to:</p>
<ul>
<li>Access your personal data</li>
<li>Rectify inaccurate data</li>
<li>Delete your data ("right to be forgotten")</li>
<li>Export your data in a portable format</li>
<li>Withdraw consent at any time</li>
</ul>
<p>You can delete all your local data at any time from the Profile screen using "Delete my data".</p>

<h2>7. Children's Privacy</h2>
<p>EnglishFlow is designed for users aged 13 and above. We do not knowingly collect personal data from children under 13. If you believe a child under 13 has provided us with personal data, please contact us immediately.</p>

<h2>8. Data Retention</h2>
<p>Local data is retained on your device until you delete it. Server-side data (if an account is created) is retained for the duration of your account and deleted within 30 days of account deletion.</p>

<h2>9. Changes to This Policy</h2>
<p>We may update this privacy policy from time to time. The updated version will be indicated by the "Last updated" date at the top of this page and will be available within the app and at this URL.</p>

<h2>10. Contact</h2>
<div class="contact">
<p>For questions about this privacy policy or to exercise your data rights, contact us at:</p>
<p><strong>Email:</strong> englishflow.app@gmail.com</p>
</div>
</body>
</html>`);
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
