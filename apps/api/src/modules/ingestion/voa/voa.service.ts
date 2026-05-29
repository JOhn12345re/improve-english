import { createHash } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ContentSource, IngestionStatus, JobStatus } from '@prisma/client';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Prisma } from '@prisma/client';
import RssParser from 'rss-parser';
import {
  VOA_FEEDS,
  VOA_MAX_WORDS,
  VOA_MIN_WORDS,
  SOURCE_TO_PRISMA,
} from './voa.constants';

type VoaSource = keyof typeof VOA_FEEDS;

interface JobMetrics {
  found: number;
  imported: number;
  skipped: number;
  failed: number;
  errors: string[];
}

@Injectable()
export class VoaIngesterService {
  private readonly logger = new Logger(VoaIngesterService.name);
  private readonly parser = new RssParser({
    customFields: {
      item: [
        ['content:encoded', 'contentEncoded'],
        ['enclosure', 'enclosure', { keepArray: false }],
      ],
    },
  });
  private readonly s3: S3Client;
  private readonly s3Bucket: string;
  private readonly s3PublicUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const region = config.get<string>('aws.region', 'eu-west-3');
    const credentials = {
      accessKeyId: config.get<string>('aws.accessKeyId', ''),
      secretAccessKey: config.get<string>('aws.secretAccessKey', ''),
    };
    this.s3 = new S3Client({ region, credentials });
    this.s3Bucket = config.get<string>('polly.s3Bucket', '');
    this.s3PublicUrl = config.get<string>('s3.publicUrl', '');
  }

  async ingestFeed(source: VoaSource): Promise<JobMetrics> {
    const feedUrl = VOA_FEEDS[source];
    const prismaSource: ContentSource = SOURCE_TO_PRISMA[source];

    this.logger.log(`Starting VOA ingest: ${source}`);

    const job = await this.prisma.ingestionJob.create({
      data: { source: prismaSource, status: JobStatus.RUNNING },
    });

    const metrics: JobMetrics = { found: 0, imported: 0, skipped: 0, failed: 0, errors: [] };

    try {
      const feed = await this.parser.parseURL(feedUrl);
      metrics.found = feed.items.length;

      for (const item of feed.items) {
        try {
          await this.processItem(item, prismaSource, metrics);
        } catch (err) {
          metrics.failed++;
          const msg = (err as Error).message;
          metrics.errors.push(`[${item.link ?? 'unknown'}] ${msg}`);
          this.logger.warn(`Failed to process item: ${msg}`);
        }
      }

      await this.prisma.ingestionJob.update({
        where: { id: job.id },
        data: {
          status: JobStatus.COMPLETED,
          finished_at: new Date(),
          items_found: metrics.found,
          items_imported: metrics.imported,
          items_skipped: metrics.skipped,
          items_failed: metrics.failed,
          error_log: metrics.errors.length ? { errors: metrics.errors } : undefined,
        },
      });

      this.logger.log(
        `VOA ${source} done — found:${metrics.found} imported:${metrics.imported} skipped:${metrics.skipped} failed:${metrics.failed}`,
      );
    } catch (err) {
      const msg = (err as Error).message;
      this.logger.error(`Fatal error ingesting ${source}: ${msg}`);
      await this.prisma.ingestionJob.update({
        where: { id: job.id },
        data: {
          status: JobStatus.FAILED,
          finished_at: new Date(),
          error_log: { fatal: msg },
        },
      });
    }

    return metrics;
  }

  async ingestAll(): Promise<void> {
    for (const source of Object.keys(VOA_FEEDS) as VoaSource[]) {
      await this.ingestFeed(source);
    }
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private async processItem(
    item: RssParser.Item & { contentEncoded?: string; enclosure?: { url?: string } },
    source: ContentSource,
    metrics: JobMetrics,
  ): Promise<void> {
    const sourceUrl = item.link ?? item.guid;
    if (!sourceUrl) {
      metrics.skipped++;
      return;
    }

    // Idempotence — skip if already ingested
    const exists = await this.prisma.rawContent.findUnique({ where: { source_url: sourceUrl } });
    if (exists) {
      metrics.skipped++;
      return;
    }

    const text = this.extractText(item);
    const wordCount = countWords(text);

    // Quality filter
    if (wordCount < VOA_MIN_WORDS || wordCount > VOA_MAX_WORDS) {
      await this.prisma.rawContent.create({
        data: {
          source,
          source_url: sourceUrl,
          source_meta: { feedItem: sanitizeMeta(item) } as Prisma.InputJsonValue,
          title: item.title ?? 'Untitled',
          text,
          word_count: wordCount,
          topics: [],
          status: IngestionStatus.REJECTED,
        },
      });
      metrics.skipped++;
      return;
    }

    // Download + upload audio (best-effort)
    const audioUrl = await this.downloadAndUploadAudio(
      item.enclosure?.url,
      sourceUrl,
    );

    await this.prisma.rawContent.create({
      data: {
        source,
        source_url: sourceUrl,
        source_meta: { feedItem: sanitizeMeta(item) } as Prisma.InputJsonValue,
        title: item.title ?? 'Untitled',
        text,
        audio_url: audioUrl ?? null,
        word_count: wordCount,
        topics: [],
        status: IngestionStatus.PENDING,
      },
    });

    metrics.imported++;
  }

  private extractText(
    item: RssParser.Item & { contentEncoded?: string },
  ): string {
    const raw =
      item.contentEncoded ?? item.content ?? item.contentSnippet ?? '';
    // Strip HTML tags and normalize whitespace
    return raw
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async downloadAndUploadAudio(
    enclosureUrl: string | undefined,
    sourceUrl: string,
  ): Promise<string | null> {
    if (!enclosureUrl || !this.s3Bucket) return null;

    const key = `voa/${sha256(sourceUrl)}.mp3`;

    try {
      const audioBuffer = await fetchWithRetry(enclosureUrl);
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.s3Bucket,
          Key: key,
          Body: audioBuffer,
          ContentType: 'audio/mpeg',
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
      return `${this.s3PublicUrl}/${key}`;
    } catch (err) {
      this.logger.warn(
        `Audio upload failed for ${enclosureUrl}: ${(err as Error).message}`,
      );
      return null;
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function sha256(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

function sanitizeMeta(item: RssParser.Item): Record<string, unknown> {
  return {
    title: item.title,
    link: item.link,
    pubDate: item.pubDate,
    categories: item.categories,
  };
}

async function fetchWithRetry(
  url: string,
  attempts = 3,
  baseDelayMs = 1_000,
): Promise<Buffer> {
  let lastErr: Error = new Error('Unknown error');
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastErr = err as Error;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, baseDelayMs * Math.pow(2, i)));
      }
    }
  }
  throw lastErr;
}
