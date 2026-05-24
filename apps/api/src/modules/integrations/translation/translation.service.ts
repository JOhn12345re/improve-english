import { createHash } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import CircuitBreaker from 'opossum';
import { RedisService } from '../../../common/cache/redis.service';
import { withRetry } from '../../../common/http/retry.util';
import {
  DeepLResponse,
  MyMemoryResponse,
  TranslationResult,
} from './translation.types';

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days
const MYMEMORY_BASE = 'https://api.mymemory.translated.net/get';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly deeplApiKey: string;
  private readonly deeplApiUrl: string;

  private readonly myMemoryBreaker: CircuitBreaker<
    [string, string, string],
    string
  >;
  private readonly deeplBreaker: CircuitBreaker<
    [string, string, string],
    string
  >;

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    this.deeplApiKey = this.config.get<string>('deepl.apiKey', '');
    this.deeplApiUrl = this.config.get<string>(
      'deepl.apiUrl',
      'https://api-free.deepl.com/v2',
    );

    this.myMemoryBreaker = new CircuitBreaker(
      this.callMyMemory.bind(this),
      { timeout: 6_000, errorThresholdPercentage: 50, volumeThreshold: 5, resetTimeout: 30_000 },
    );
    this.deeplBreaker = new CircuitBreaker(
      this.callDeepL.bind(this),
      { timeout: 8_000, errorThresholdPercentage: 50, volumeThreshold: 5, resetTimeout: 30_000 },
    );

    for (const [name, cb] of [
      ['MyMemory', this.myMemoryBreaker],
      ['DeepL', this.deeplBreaker],
    ] as const) {
      cb.on('open', () => this.logger.warn(`${name} circuit breaker OPEN`));
      cb.on('close', () => this.logger.log(`${name} circuit breaker CLOSED`));
    }
  }

  /**
   * Translates text using:
   *   - Free users  → MyMemory (no key required, ~10K chars/day per IP)
   *   - Premium     → DeepL (500K chars/month on free API tier)
   *
   * Results are cached for 90 days using sha256(text) as part of the key,
   * keyed by provider so free/premium users never share stale translations.
   *
   * @param text      - Text to translate.
   * @param srcLang   - Source language code (e.g. 'fr', 'en').
   * @param tgtLang   - Target language code (e.g. 'en', 'fr').
   * @param isPremium - Whether to use DeepL instead of MyMemory.
   */
  async translate(
    text: string,
    srcLang: string,
    tgtLang: string,
    isPremium = false,
  ): Promise<TranslationResult> {
    const provider = isPremium && this.deeplApiKey ? 'deepl' : 'mymemory';
    const hash = sha256(text);
    const cacheKey = `trans:${provider}:${srcLang}:${tgtLang}:${hash}`;

    const cached = await this.redis.getJson<TranslationResult>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`Cache MISS ${cacheKey} — calling ${provider}`);

    const translatedText =
      provider === 'deepl'
        ? await this.deeplBreaker.fire(text, srcLang, tgtLang)
        : await this.myMemoryBreaker.fire(text, srcLang, tgtLang);

    const result: TranslationResult = {
      originalText: text,
      translatedText,
      sourceLang: srcLang,
      targetLang: tgtLang,
      provider,
    };

    await this.redis.setJson(cacheKey, result, CACHE_TTL_SECONDS);
    return result;
  }

  /** Pings both providers and returns their status. */
  async ping(): Promise<{
    mymemory: { status: 'ok' | 'error' | 'skipped'; latencyMs: number };
    deepl: { status: 'ok' | 'error' | 'skipped'; latencyMs: number };
  }> {
    const myMemoryResult = await this.timePing(() =>
      this.callMyMemory('hello', 'en', 'fr'),
    );

    const deeplResult = this.deeplApiKey
      ? await this.timePing(() => this.callDeepL('hello', 'EN', 'FR'))
      : { status: 'skipped' as const, latencyMs: 0 };

    return { mymemory: myMemoryResult, deepl: deeplResult };
  }

  // ── Private — MyMemory ────────────────────────────────────────────────────

  private async callMyMemory(
    text: string,
    srcLang: string,
    tgtLang: string,
  ): Promise<string> {
    return withRetry(
      async () => {
        const url = `${MYMEMORY_BASE}?q=${encodeURIComponent(text)}&langpair=${srcLang}|${tgtLang}`;
        const response = await fetch(url, { headers: { Accept: 'application/json' } });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} from MyMemory`);
        }

        const data = (await response.json()) as MyMemoryResponse;

        if (data.responseStatus !== 200) {
          throw new Error(`MyMemory error status: ${data.responseStatus}`);
        }
        if (data.quotaFinished) {
          throw new Error('MyMemory daily quota exceeded');
        }

        return data.responseData.translatedText;
      },
      { attempts: 3, baseDelayMs: 500, label: 'MyMemory' },
    );
  }

  // ── Private — DeepL ───────────────────────────────────────────────────────

  private async callDeepL(
    text: string,
    srcLang: string,
    tgtLang: string,
  ): Promise<string> {
    return withRetry(
      async () => {
        // DeepL expects uppercase ISO 639-1 codes
        const response = await fetch(`${this.deeplApiUrl}/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `DeepL-Auth-Key ${this.deeplApiKey}`,
          },
          body: JSON.stringify({
            text: [text],
            source_lang: srcLang.toUpperCase(),
            target_lang: tgtLang.toUpperCase(),
          }),
        });

        if (!response.ok) {
          const body = await response.text().catch(() => '');
          throw new Error(`HTTP ${response.status} from DeepL: ${body}`);
        }

        const data = (await response.json()) as DeepLResponse;
        const translated = data.translations?.[0]?.text;

        if (!translated) {
          throw new Error('DeepL returned empty translation');
        }

        return translated;
      },
      { attempts: 3, baseDelayMs: 500, label: 'DeepL' },
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async timePing(
    fn: () => Promise<unknown>,
  ): Promise<{ status: 'ok' | 'error'; latencyMs: number }> {
    const start = Date.now();
    try {
      await fn();
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch {
      return { status: 'error', latencyMs: Date.now() - start };
    }
  }
}

function sha256(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}
