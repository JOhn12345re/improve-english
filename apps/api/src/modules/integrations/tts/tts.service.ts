import { createHash } from 'crypto';
import { Readable } from 'stream';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PollyClient,
  SynthesizeSpeechCommand,
  Engine,
  OutputFormat,
  TextType,
  VoiceId,
} from '@aws-sdk/client-polly';
import {
  S3Client,
  HeadObjectCommand,
  PutObjectCommand,
  NotFound,
} from '@aws-sdk/client-s3';
import CircuitBreaker from 'opossum';
import { withRetry } from '../../../common/http/retry.util';
import { TtsOptions, TtsResult } from './tts.types';

@Injectable()
export class TtsService implements OnModuleInit {
  private readonly logger = new Logger(TtsService.name);
  private polly!: PollyClient;
  private s3!: S3Client;
  private readonly defaultVoiceId: string;
  private readonly s3Bucket: string;
  private readonly cdnBaseUrl: string;
  private breaker!: CircuitBreaker<[string, string], Buffer>;

  constructor(private readonly config: ConfigService) {
    this.defaultVoiceId = config.get<string>('polly.voiceId', 'Joanna');
    this.s3Bucket = config.get<string>('polly.s3Bucket', '');
    this.cdnBaseUrl = config.get<string>('s3.publicUrl', '');
  }

  onModuleInit(): void {
    const region = this.config.get<string>('aws.region', 'eu-west-3');
    const credentials = {
      accessKeyId: this.config.get<string>('aws.accessKeyId', ''),
      secretAccessKey: this.config.get<string>('aws.secretAccessKey', ''),
    };

    this.polly = new PollyClient({ region, credentials });
    this.s3 = new S3Client({ region, credentials });

    // Circuit breaker wraps Polly synthesis only
    (this as any).breaker = new CircuitBreaker(
      this.synthesizeWithPolly.bind(this),
      { timeout: 15_000, errorThresholdPercentage: 50, volumeThreshold: 3, resetTimeout: 60_000 },
    );
    (this as any).breaker.on('open', () =>
      this.logger.warn('Polly circuit breaker OPEN'),
    );
    (this as any).breaker.on('close', () =>
      this.logger.log('Polly circuit breaker CLOSED'),
    );
  }

  /**
   * Returns a CDN URL for the audio of the given text.
   *
   * Strategy:
   *   1. Compute S3 key = audio/{voiceId}/{sha256(text)}.mp3
   *   2. HeadObject → if exists, return CDN URL immediately (cache hit)
   *   3. Otherwise: call Polly → upload to S3 → return CDN URL (cache miss)
   *
   * S3 acts as a permanent cache; no Redis TTL is needed.
   */
  async getOrGenerateAudio(
    text: string,
    options: TtsOptions = {},
  ): Promise<TtsResult> {
    const voiceId = options.voiceId ?? this.defaultVoiceId;
    const s3Key = `audio/${voiceId}/${sha256(text)}.mp3`;

    // 1. Check S3
    const exists = await this.existsOnS3(s3Key);
    if (exists) {
      this.logger.debug(`S3 cache HIT: ${s3Key}`);
      return { url: this.cdnUrl(s3Key), s3Key, fromCache: true };
    }

    // 2. Synthesise
    this.logger.debug(`S3 cache MISS: ${s3Key} — calling Polly`);
    const audioBuffer = await (this as any).breaker.fire(text, voiceId);

    // 3. Upload
    await this.uploadToS3(s3Key, audioBuffer);

    return { url: this.cdnUrl(s3Key), s3Key, fromCache: false };
  }

  /** Pings Polly with a short phrase to verify connectivity. */
  async ping(): Promise<{ status: 'ok' | 'error' | 'skipped'; latencyMs: number }> {
    if (!this.config.get<string>('aws.accessKeyId', '')) {
      return { status: 'skipped', latencyMs: 0 };
    }
    const start = Date.now();
    try {
      await this.synthesizeWithPolly('test', this.defaultVoiceId);
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch {
      return { status: 'error', latencyMs: Date.now() - start };
    }
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private async synthesizeWithPolly(text: string, voiceId: string): Promise<Buffer> {
    return withRetry(
      async () => {
        const command = new SynthesizeSpeechCommand({
          Text: text,
          TextType: TextType.TEXT,
          VoiceId: voiceId as VoiceId,
          OutputFormat: OutputFormat.MP3,
          Engine: Engine.NEURAL,
        });

        const response = await this.polly.send(command);

        if (!response.AudioStream) {
          throw new Error('Polly returned no AudioStream');
        }

        return streamToBuffer(response.AudioStream as Readable);
      },
      { attempts: 3, baseDelayMs: 1_000, label: 'Polly' },
    );
  }

  private async existsOnS3(key: string): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadObjectCommand({ Bucket: this.s3Bucket, Key: key }),
      );
      return true;
    } catch (err) {
      if (err instanceof NotFound || (err as any)?.name === 'NotFound') {
        return false;
      }
      // Any other error (auth, network) — treat as miss and let Polly handle it
      this.logger.warn(`S3 HeadObject error for ${key}: ${(err as Error).message}`);
      return false;
    }
  }

  private async uploadToS3(key: string, body: Buffer): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: body,
        ContentType: 'audio/mpeg',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    this.logger.debug(`Uploaded to S3: ${key}`);
  }

  private cdnUrl(key: string): string {
    return `${this.cdnBaseUrl}/${key}`;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function sha256(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
