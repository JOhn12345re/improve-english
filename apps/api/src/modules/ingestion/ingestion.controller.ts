import {
  Body, Controller, Delete, Get, Param, Post, UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VoaIngesterService } from './voa/voa.service';
import { CecrlClassifierService } from './classifier/cecrl-classifier.service';
import { LessonGeneratorService } from './lesson-generator/lesson-generator.service';
import { PdfIngesterService } from './pdf/pdf-ingester.service';
import { PdfExtractorService } from './pdf/pdf-extractor.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { IngestionStatus } from '@prisma/client';
import { PDF_SOURCES, ArchiveOrgSource, GutenbergSource } from './pdf/sources.config';

/**
 * Admin endpoints to pilot content ingestion.
 * TODO: add JWT guard + admin role check before production.
 */
@Controller('admin/ingestion')
export class IngestionController {
  constructor(
    private readonly voa: VoaIngesterService,
    private readonly classifier: CecrlClassifierService,
    private readonly generator: LessonGeneratorService,
    private readonly pdfIngester: PdfIngesterService,
    private readonly pdfExtractor: PdfExtractorService,
    private readonly prisma: PrismaService,
  ) {}

  /** GET /admin/ingestion/stats */
  @Get('stats')
  async stats() {
    const [bySource, byStatus, byLevel, recentJobs, totalLessons] = await Promise.all([
      this.prisma.rawContent.groupBy({ by: ['source'], _count: true }),
      this.prisma.rawContent.groupBy({ by: ['status'], _count: true }),
      this.prisma.rawContent.groupBy({ by: ['detected_level'], _count: true }),
      this.prisma.ingestionJob.findMany({ orderBy: { started_at: 'desc' }, take: 10 }),
      this.prisma.lesson.count({ where: { raw_content_id: { not: null } } }),
    ]);
    return { bySource, byStatus, byLevel, recentJobs, totalGeneratedLessons: totalLessons };
  }

  /** GET /admin/ingestion/jobs */
  @Get('jobs')
  async jobs() {
    return this.prisma.ingestionJob.findMany({ orderBy: { started_at: 'desc' }, take: 50 });
  }

  /** POST /admin/ingestion/voa/trigger — full VOA ingest */
  @Post('voa/trigger')
  triggerVoa() {
    void this.voa.ingestAll().catch(() => {});
    return { message: 'VOA ingestion started' };
  }

  /** POST /admin/ingestion/voa/trigger/:source */
  @Post('voa/trigger/:source')
  triggerVoaFeed(
    @Param('source') source: 'VOA_BEGINNING' | 'VOA_INTERMEDIATE' | 'VOA_ADVANCED',
  ) {
    void this.voa.ingestFeed(source).catch(() => {});
    return { message: `VOA ${source} ingestion started` };
  }

  /** POST /admin/ingestion/classify/trigger — classify up to N pending items */
  @Post('classify/trigger')
  async triggerClassify(@Body() body: { limit?: number }) {
    const limit = Math.min(body?.limit ?? 100, 500);
    const pending = await this.prisma.rawContent.findMany({
      where: { status: IngestionStatus.PENDING },
      select: { id: true },
      take: limit,
      orderBy: { ingested_at: 'asc' },
    });
    void this.classifier.classifyBatch(pending.map((p) => p.id)).catch(() => {});
    return { message: `Classifying ${pending.length} items` };
  }

  /** POST /admin/ingestion/generate-lessons — generate from up to N classified items */
  @Post('generate-lessons')
  async triggerGenerate(@Body() body: { limit?: number }) {
    const limit = Math.min(body?.limit ?? 20, 100);
    const classified = await this.prisma.rawContent.findMany({
      where: { status: IngestionStatus.CLASSIFIED },
      select: { id: true },
      take: limit,
      orderBy: { processed_at: 'asc' },
    });
    void this.generator.generateBatch(classified.map((c) => c.id)).catch(() => {});
    return { message: `Generating lessons for ${classified.length} items` };
  }

  /** POST /admin/ingestion/pdf/trigger — ingest all configured PDF sources */
  @Post('pdf/trigger')
  triggerPdf() {
    for (const source of PDF_SOURCES) {
      if (source.type === 'archive_org') {
        void this.pdfIngester.ingestArchiveOrg(source as ArchiveOrgSource).catch(() => {});
      } else if (source.type === 'gutenberg') {
        void this.pdfIngester.ingestGutenberg(source as GutenbergSource).catch(() => {});
      }
    }
    return { message: `PDF ingestion started for ${PDF_SOURCES.length} sources` };
  }

  /** POST /admin/ingestion/upload-pdf — manual PDF upload */
  @Post('upload-pdf')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { declaredLicense: string; declaredLevel?: string; title?: string },
  ) {
    if (!file) return { error: 'No file uploaded' };

    const extracted = await this.pdfExtractor.extractText(file.buffer);
    const title = body.title ?? file.originalname.replace(/\.pdf$/i, '');

    return this.pdfIngester.ingestManualUpload(
      extracted.text,
      title,
      body.declaredLicense,
      body.declaredLevel,
    );
  }

  /** GET /admin/ingestion/raw/:id */
  @Get('raw/:id')
  getRaw(@Param('id') id: string) {
    return this.prisma.rawContent.findUnique({ where: { id } });
  }

  /** POST /admin/ingestion/raw/:id/regenerate */
  @Post('raw/:id/regenerate')
  async regenerate(@Param('id') id: string) {
    await this.prisma.rawContent.update({
      where: { id },
      data: { status: IngestionStatus.CLASSIFIED },
    });
    void this.generator.generateFromRawContent(id).catch(() => {});
    return { message: `Regeneration started for ${id}` };
  }

  /** DELETE /admin/ingestion/raw/:id — reject a content */
  @Delete('raw/:id')
  async reject(@Param('id') id: string) {
    await this.prisma.rawContent.update({
      where: { id },
      data: { status: IngestionStatus.REJECTED },
    });
    return { message: `Content ${id} rejected` };
  }
}
