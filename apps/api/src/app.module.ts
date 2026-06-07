import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { CacheModule } from './common/cache/cache.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { ProgressModule } from './modules/progress/progress.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { HealthModule } from './modules/health/health.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { AiModule } from './modules/ai/ai.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import configuration from './config/configuration';
import { validate } from './config/config.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], validate }),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 100 }] }),
    PrismaModule,
    CacheModule,
    HealthModule,
    AuthModule,
    UsersModule,
    LessonsModule,
    ProgressModule,
    VocabularyModule,
    SubscriptionsModule,
    IntegrationsModule,
    AiModule,
    IngestionModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
