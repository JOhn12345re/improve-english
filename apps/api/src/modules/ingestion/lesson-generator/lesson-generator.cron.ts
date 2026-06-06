import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as cron from 'node-cron';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { LessonGeneratorService } from './lesson-generator.service';
import { IngestionStatus } from '@prisma/client';

const BATCH_SIZE = 20;

@Injectable()
export class LessonGeneratorCron implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LessonGeneratorCron.name);
  private task: cron.ScheduledTask | null = null;

  constructor(
    private readonly generator: LessonGeneratorService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    // Every 2 hours
    this.task = cron.schedule('0 */2 * * *', () => this.generatePending(), {
      timezone: 'Europe/Paris',
    });
    this.logger.log('Lesson generator cron scheduled (every 2 hours)');
  }

  onModuleDestroy() {
    this.task?.stop();
  }

  /** Generates lessons from up to 20 CLASSIFIED items. */
  async generatePending(): Promise<void> {
    try {
      const classified = await this.prisma.rawContent.findMany({
        where: { status: IngestionStatus.CLASSIFIED },
        select: { id: true },
        take: BATCH_SIZE,
        orderBy: { processed_at: 'asc' },
      });

      if (classified.length === 0) return;

      this.logger.log(`Generating lessons for ${classified.length} classified items`);
      const total = await this.generator.generateBatch(classified.map((c) => c.id));
      this.logger.log(`Generated ${total} lesson(s) total`);
    } catch (err) {
      this.logger.error('Lesson generator cron failed', err);
    }
  }
}
