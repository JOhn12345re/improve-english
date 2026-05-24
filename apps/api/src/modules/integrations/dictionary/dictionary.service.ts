import { Injectable, Logger } from '@nestjs/common';
import CircuitBreaker from 'opossum';
import { RedisService } from '../../../common/cache/redis.service';
import { withRetry } from '../../../common/http/retry.util';
import { DictionaryEntry } from './dictionary.types';

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);
  private readonly breaker: CircuitBreaker<[string], DictionaryEntry | null>;

  constructor(private readonly redis: RedisService) {
    this.breaker = new CircuitBreaker(this.fetchFromApi.bind(this), {
      timeout: 5_000,
      errorThresholdPercentage: 50,
      volumeThreshold: 5,
      resetTimeout: 30_000,
    });

    this.breaker.on('open', () =>
      this.logger.warn('DictionaryAPI circuit breaker OPEN — calls blocked'),
    );
    this.breaker.on('halfOpen', () =>
      this.logger.log('DictionaryAPI circuit breaker HALF-OPEN — testing'),
    );
    this.breaker.on('close', () =>
      this.logger.log('DictionaryAPI circuit breaker CLOSED — normal operation'),
    );
  }

  /**
   * Look up a word in the Free Dictionary API.
   * Results are cached in Redis for 30 days.
   * Returns null if the word is not found (404).
   */
  async lookup(word: string): Promise<DictionaryEntry | null> {
    const cacheKey = `dict:${word.toLowerCase().trim()}`;

    const cached = await this.redis.getJson<DictionaryEntry>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT for dict:${word}`);
      return cached;
    }

    this.logger.debug(`Cache MISS for dict:${word} — calling API`);
    const entry = await this.breaker.fire(word);

    if (entry) {
      await this.redis.setJson(cacheKey, entry, CACHE_TTL_SECONDS);
    }

    return entry;
  }

  /**
   * Pings the API with a known word ("hello") to verify connectivity.
   */
  async ping(): Promise<{ status: 'ok' | 'error'; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.fetchFromApi('hello');
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch {
      return { status: 'error', latencyMs: Date.now() - start };
    }
  }

  // ── Private ────────────────────────────────────────────────────────

  private async fetchFromApi(word: string): Promise<DictionaryEntry | null> {
    return withRetry(
      async () => {
        const response = await fetch(
          `${BASE_URL}/${encodeURIComponent(word)}`,
          { headers: { Accept: 'application/json' } },
        );

        if (response.status === 404) return null;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} from DictionaryAPI`);
        }

        const data = (await response.json()) as any[];
        const first = data[0];
        if (!first) return null;

        const audioUrl: string | undefined = (first.phonetics as any[])
          ?.map((p: any) => p.audio as string)
          .find((a) => a?.endsWith('.mp3'));

        return {
          word: first.word as string,
          phonetic: first.phonetic as string | undefined,
          phonetics: (first.phonetics ?? []) as DictionaryEntry['phonetics'],
          meanings: (first.meanings ?? []) as DictionaryEntry['meanings'],
          audioUrl,
        };
      },
      { attempts: 3, baseDelayMs: 500, label: 'DictionaryAPI' },
    );
  }
}
