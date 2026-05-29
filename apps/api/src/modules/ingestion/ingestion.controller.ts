import { Controller, Get, Param, Post } from '@nestjs/common';
import { VoaIngesterService } from './voa/voa.service';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Admin endpoints to trigger and monitor ingestion.
 * No auth guard for now — add JWT + admin role before going to production.
 */
@Controller('admin/ingestion')
export class IngestionController {
  constructor(
    private readonly voa: VoaIngesterService,
    private readonly prisma: PrismaService,
  ) {}

  /** GET /admin/ingestion/stats — RawContent counts by source + status */
  @Get('stats')
  async stats() {
    const [bySource, byStatus, byLevel, jobs] = await Promise.all([
      this.prisma.rawContent.groupBy({ by: ['source'], _count: true }),
      this.prisma.rawContent.groupBy({ by: ['status'], _count: true }),
      this.prisma.rawContent.groupBy({ by: ['detected_level'], _count: true }),
      this.prisma.ingestionJob.findMany({
        orderBy: { started_at: 'desc' },
        take: 10,
      }),
    ]);
    return { bySource, byStatus, byLevel, recentJobs: jobs };
  }

  /** GET /admin/ingestion/jobs — last 50 ingestion jobs */
  @Get('jobs')
  async jobs() {
    return this.prisma.ingestionJob.findMany({
      orderBy: { started_at: 'desc' },
      take: 50,
    });
  }

  /** POST /admin/ingestion/voa/trigger — manually trigger full VOA ingest */
  @Post('voa/trigger')
  async triggerVoa() {
    // Fire and forget — returns immediately
    void this.voa.ingestAll().catch(() => {});
    return { message: 'VOA ingestion started' };
  }

  /** POST /admin/ingestion/voa/trigger/:source — trigger a single VOA feed */
  @Post('voa/trigger/:source')
  async triggerVoaFeed(
    @Param('source') source: 'VOA_BEGINNING' | 'VOA_INTERMEDIATE' | 'VOA_ADVANCED',
  ) {
    void this.voa.ingestFeed(source).catch(() => {});
    return { message: `VOA ${source} ingestion started` };
  }

  /** GET /admin/ingestion/raw/:id — view a single RawContent */
  @Get('raw/:id')
  async getRaw(@Param('id') id: string) {
    return this.prisma.rawContent.findUnique({ where: { id } });
  }
}
