import { createHash } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import CircuitBreaker from 'opossum';
import { RedisService } from '../../../common/cache/redis.service';
import { withRetry } from '../../../common/http/retry.util';
import { CorrectionResult, LtMatch, SupportedLanguage } from './languagetool.types';

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

@Injectable()
export class LanguageToolService {
  private readonly logger = new Logger(LanguageToolService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly breaker: CircuitBreaker<[string, SupportedLanguage], CorrectionResult>;

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    this.apiUrl = this.config.get<string>('languagetool.url', 'http://localhost:8010/v2');
    this.apiKey = this.config.get<string>('languagetool.apiKey', '');

    this.breaker = new CircuitBreaker(this.fetchCorrections.bind(this), {
      timeout: 8_000,
      errorThresholdPercentage: 50,
      volumeThreshold: 5,
      resetTimeout: 30_000,
    });

    this.breaker.on('open', () =>
      this.logger.warn('LanguageTool circuit breaker OPEN'),
    );
    this.breaker.on('close', () =>
      this.logger.log('LanguageTool circuit breaker CLOSED'),
    );
  }

  /**
   * Checks the given text for grammar and spelling errors.
   * Results are cached by SHA-256(text + language) for 7 days.
   *
   * @param text     - The text to analyse.
   * @param language - BCP-47 language code (default: 'en-US').
   */
  async check(
    text: string,
    language: SupportedLanguage = 'en-US',
  ): Promise<CorrectionResult> {
    const hash = sha256(`${language}:${text}`);
    const cacheKey = `lt:${hash}`;

    const cached = await this.redis.getJson<CorrectionResult>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`Cache MISS ${cacheKey} — calling LanguageTool`);
    const result = await this.breaker.fire(text, language);

    await this.redis.setJson(cacheKey, result, CACHE_TTL_SECONDS);
    return result;
  }

  /** Pings the LanguageTool instance with a short known-correct sentence. */
  async ping(): Promise<{ status: 'ok' | 'error'; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.fetchCorrections('Hello, world!', 'en-US');
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch {
      return { status: 'error', latencyMs: Date.now() - start };
    }
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private async fetchCorrections(
    text: string,
    language: SupportedLanguage,
  ): Promise<CorrectionResult> {
    return withRetry(
      async () => {
        const body = new URLSearchParams({ text, language });
        if (this.apiKey) body.set('apiKey', this.apiKey);

        const response = await fetch(`${this.apiUrl}/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} from LanguageTool`);
        }

        const data = await response.json() as { matches: LtMatch[] };
        const matches = data.matches ?? [];

        return {
          text,
          language,
          matches,
          errorCount: matches.length,
          isCorrect: matches.length === 0,
        };
      },
      { attempts: 3, baseDelayMs: 500, label: 'LanguageTool' },
    );
  }
}

function sha256(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}
