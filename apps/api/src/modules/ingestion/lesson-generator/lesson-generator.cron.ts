import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { LessonGeneratorService } from './lesson-generator.service';
import { IngestionStatus } from '@prisma/client';

const BATCH_SIZE = 20;

@Injectable()
export class LessonGeneratorCron {
  private readonly logger = new Logger(LessonGeneratorCron.name);

  constructor(
    private readonly generator: LessonGeneratorService,
    private readonly prisma: PrismaService,
  ) {}

  /** Runs every 2 hours — generates lessons from up to 20 CLASSIFIED items. */
  @Cron('0 */2 * * *', { timeZone: 'Europe/Paris' })
  async generatePending(): Promise<void> {
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
  }
}
