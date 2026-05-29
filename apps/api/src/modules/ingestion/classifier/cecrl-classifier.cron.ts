import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CecrlClassifierService } from './cecrl-classifier.service';
import { IngestionStatus } from '@prisma/client';

const BATCH_SIZE = 200;

@Injectable()
export class CecrlClassifierCron {
  private readonly logger = new Logger(CecrlClassifierCron.name);

  constructor(
    private readonly classifier: CecrlClassifierService,
    private readonly prisma: PrismaService,
  ) {}

  /** Runs every hour — classifies up to 200 PENDING items. */
  @Cron('0 * * * *', { timeZone: 'Europe/Paris' })
  async classifyPending(): Promise<void> {
    const pending = await this.prisma.rawContent.findMany({
      where: { status: IngestionStatus.PENDING },
      select: { id: true },
      take: BATCH_SIZE,
      orderBy: { ingested_at: 'asc' },
    });

    if (pending.length === 0) return;

    this.logger.log(`Classifying ${pending.length} pending items`);
    await this.classifier.classifyBatch(pending.map((p) => p.id));
  }
}
