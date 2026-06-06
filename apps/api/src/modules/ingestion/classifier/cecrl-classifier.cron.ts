import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as cron from 'node-cron';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CecrlClassifierService } from './cecrl-classifier.service';
import { IngestionStatus } from '@prisma/client';

const BATCH_SIZE = 200;

@Injectable()
export class CecrlClassifierCron implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CecrlClassifierCron.name);
  private task: cron.ScheduledTask | null = null;

  constructor(
    private readonly classifier: CecrlClassifierService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    // Every hour
    this.task = cron.schedule('0 * * * *', () => this.classifyPending(), {
      timezone: 'Europe/Paris',
    });
    this.logger.log('CECRL classifier cron scheduled (every hour)');
  }

  onModuleDestroy() {
    this.task?.stop();
  }

  /** Classifies up to 200 PENDING items. */
  async classifyPending(): Promise<void> {
    try {
      const pending = await this.prisma.rawContent.findMany({
        where: { status: IngestionStatus.PENDING },
        select: { id: true },
        take: BATCH_SIZE,
        orderBy: { ingested_at: 'asc' },
      });

      if (pending.length === 0) return;

      this.logger.log(`Classifying ${pending.length} pending items`);
      await this.classifier.classifyBatch(pending.map((p) => p.id));
    } catch (err) {
      this.logger.error('CECRL classifier cron failed', err);
    }
  }
}
