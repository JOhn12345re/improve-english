import { createHash } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ContentSource, IngestionStatus, JobStatus } from '@prisma/client';
import { PdfExtractorService } from './pdf-extractor.service';
import { ArchiveOrgFetcherService } from './archive-org-fetcher.service';
import { GutenbergFetcherService } from './gutenberg-fetcher.service';
import { ArchiveOrgSource, GutenbergSource, isLicenseAllowed } from './sources.config';
import { Prisma } from '@prisma/client';

const MIN_WORDS = 200;
const MAX_WORDS = 15_000;
const CHUNK_MIN_WORDS = 400;
const CHUNK_MAX_WORDS = 2000;

@Injectable()
export class PdfIngesterService {
  private readonly logger = new Logger(PdfIngesterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly extractor: PdfExtractorService,
    private readonly archiveOrg: ArchiveOrgFetcherService,
    private readonly gutenberg: GutenbergFetcherService,
  ) {}

  async ingestArchiveOrg(config: ArchiveOrgSource): Promise<void> {
    const job = await this.prisma.ingestionJob.create({
      data: { source: ContentSource.ARCHIVE_ORG, status: JobStatus.RUNNING },
    });

    let imported = 0, skipped = 0, failed = 0;
    const errors: string[] = [];

    try {
      const identifiers = await this.archiveOrg.search(config.query, config.maxItems);
      this.logger.log(`Archive.org: found ${identifiers.length} items`);

      for (const id of identifiers) {
        try {
          const info = await this.archiveOrg.getItemInfo(id);

          if (!info.pdfUrl) {
            skipped++;
            continue;
          }

          const sourceUrl = info.pdfUrl;
          const exists = await this.prisma.rawContent.findUnique({ where: { source_url: sourceUrl } });
          if (exists) { skipped++; continue; }

          const buffer = await this.archiveOrg.downloadPdf(info.pdfUrl);
          const contentHash = sha256(buffer.toString('base64').slice(0, 1000));

          // Check hash duplicate
          const hashExists = await this.prisma.rawContent.findFirst({
            where: { source_meta: { path: ['contentHash'], equals: contentHash } },
          });
          if (hashExists) { skipped++; continue; }

          const extracted = await this.extractor.extractText(buffer);
          const wordCount = extracted.text.split(/\s+/).length;

          if (wordCount < MIN_WORDS || wordCount > MAX_WORDS) {
            skipped++;
            continue;
          }

          const chunks = this.extractor.splitIntoLessons(extracted.text, {
            minWords: CHUNK_MIN_WORDS,
            maxWords: CHUNK_MAX_WORDS,
          });

          for (const chunk of chunks.slice(0, 5)) {
            const chunkUrl = `${sourceUrl}#chunk${chunk.position}`;
            const chunkExists = await this.prisma.rawContent.findUnique({ where: { source_url: chunkUrl } });
            if (chunkExists) continue;

            await this.prisma.rawContent.create({
              data: {
                source: ContentSource.ARCHIVE_ORG,
                source_url: chunkUrl,
                source_meta: {
                  identifier: id,
                  title: info.title,
                  license: info.license,
                  contentHash,
                  chunkPosition: chunk.position,
                } as Prisma.InputJsonValue,
                title: `${info.title} — ${chunk.title}`,
                text: chunk.content,
                word_count: chunk.content.split(/\s+/).length,
                topics: [],
                status: IngestionStatus.PENDING,
              },
            });
          }

          imported++;
        } catch (err) {
          failed++;
          errors.push(`[${id}] ${(err as Error).message}`);
          this.logger.warn(`Archive.org item ${id} failed: ${(err as Error).message}`);
        }
      }

      await this.prisma.ingestionJob.update({
        where: { id: job.id },
        data: {
          status: JobStatus.COMPLETED,
          finished_at: new Date(),
          items_found: identifiers.length,
          items_imported: imported,
          items_skipped: skipped,
          items_failed: failed,
          error_log: errors.length ? { errors } as Prisma.InputJsonValue : undefined,
        },
      });
    } catch (err) {
      await this.prisma.ingestionJob.update({
        where: { id: job.id },
        data: { status: JobStatus.FAILED, finished_at: new Date(), error_log: { fatal: (err as Error).message } as Prisma.InputJsonValue },
      }).catch(() => {});
    }
  }

  async ingestGutenberg(config: GutenbergSource): Promise<void> {
    const job = await this.prisma.ingestionJob.create({
      data: { source: ContentSource.GUTENBERG, status: JobStatus.RUNNING },
    });

    let imported = 0, skipped = 0, failed = 0;

    try {
      for (const subject of config.subjects) {
        const books = await this.gutenberg.searchBySubject(subject, 20);
        this.logger.log(`Gutenberg: found ${books.length} books for "${subject}"`);

        for (const book of books) {
          try {
            const sourceUrl = `https://www.gutenberg.org/ebooks/${book.id}`;
            const exists = await this.prisma.rawContent.findUnique({ where: { source_url: sourceUrl } });
            if (exists) { skipped++; continue; }

            const text = await this.gutenberg.downloadText(book);
            if (!text || text.length < 500) { skipped++; continue; }

            const wordCount = text.split(/\s+/).length;
            if (wordCount > MAX_WORDS) {
              // Only store first chunks
              const chunks = this.extractor.splitIntoLessons(text, {
                minWords: CHUNK_MIN_WORDS,
                maxWords: CHUNK_MAX_WORDS,
              });

              for (const chunk of chunks.slice(0, 3)) {
                const chunkUrl = `${sourceUrl}#chunk${chunk.position}`;
                await this.prisma.rawContent.create({
                  data: {
                    source: ContentSource.GUTENBERG,
                    source_url: chunkUrl,
                    source_meta: {
                      gutenbergId: book.id,
                      title: book.title,
                      license: 'public_domain',
                      chunkPosition: chunk.position,
                    } as Prisma.InputJsonValue,
                    title: `${book.title} — ${chunk.title}`,
                    text: chunk.content,
                    word_count: chunk.content.split(/\s+/).length,
                    topics: [],
                    status: IngestionStatus.PENDING,
                  },
                });
              }
            } else if (wordCount >= MIN_WORDS) {
              await this.prisma.rawContent.create({
                data: {
                  source: ContentSource.GUTENBERG,
                  source_url: sourceUrl,
                  source_meta: { gutenbergId: book.id, title: book.title, license: 'public_domain' } as Prisma.InputJsonValue,
                  title: book.title,
                  text,
                  word_count: wordCount,
                  topics: [],
                  status: IngestionStatus.PENDING,
                },
              });
            }

            imported++;
          } catch (err) {
            failed++;
            this.logger.warn(`Gutenberg book ${book.id} failed: ${(err as Error).message}`);
          }
        }
      }

      await this.prisma.ingestionJob.update({
        where: { id: job.id },
        data: {
          status: JobStatus.COMPLETED,
          finished_at: new Date(),
          items_imported: imported,
          items_skipped: skipped,
          items_failed: failed,
        },
      });
    } catch (err) {
      await this.prisma.ingestionJob.update({
        where: { id: job.id },
        data: { status: JobStatus.FAILED, finished_at: new Date() },
      }).catch(() => {});
    }
  }

  async ingestManualUpload(
    text: string,
    title: string,
    declaredLicense: string,
    declaredLevel?: string,
  ): Promise<{ imported: number; reason?: string }> {
    if (!isLicenseAllowed(declaredLicense)) {
      return { imported: 0, reason: `License "${declaredLicense}" not allowed` };
    }

    const wordCount = text.split(/\s+/).length;
    if (wordCount < MIN_WORDS) {
      return { imported: 0, reason: `Text too short (${wordCount} words, min ${MIN_WORDS})` };
    }

    const hash = sha256(text.slice(0, 500));
    const sourceUrl = `manual://upload/${hash}`;

    const exists = await this.prisma.rawContent.findUnique({ where: { source_url: sourceUrl } });
    if (exists) return { imported: 0, reason: 'Duplicate content' };

    const chunks = wordCount > CHUNK_MAX_WORDS
      ? this.extractor.splitIntoLessons(text, { minWords: CHUNK_MIN_WORDS, maxWords: CHUNK_MAX_WORDS })
      : [{ title, content: text, position: 0 }];

    let imported = 0;
    for (const chunk of chunks.slice(0, 5)) {
      await this.prisma.rawContent.create({
        data: {
          source: ContentSource.MANUAL_UPLOAD,
          source_url: `${sourceUrl}#chunk${chunk.position}`,
          source_meta: { title, license: declaredLicense, chunkPosition: chunk.position } as Prisma.InputJsonValue,
          title: chunks.length > 1 ? `${title} — ${chunk.title}` : title,
          text: chunk.content,
          word_count: chunk.content.split(/\s+/).length,
          topics: [],
          ...(declaredLevel ? { detected_level: declaredLevel as any, status: IngestionStatus.CLASSIFIED } : { status: IngestionStatus.PENDING }),
        },
      });
      imported++;
    }

    return { imported };
  }
}

function sha256(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex').slice(0, 16);
}
