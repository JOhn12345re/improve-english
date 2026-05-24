import { Injectable, Logger } from '@nestjs/common';
import CircuitBreaker from 'opossum';
import { RedisService } from '../../../common/cache/redis.service';
import { withRetry } from '../../../common/http/retry.util';
import { DatamuseWord, RatedWord } from './datamuse.types';
import { frequencyToCefrLevel, parseFrequencyTag } from './level-mapper.util';
import { CefrLevel } from '@englishflow/shared-types';

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const BASE_URL = 'https://api.datamuse.com';
const DEFAULT_MAX = 20;

@Injectable()
export class DatamuseService {
  private readonly logger = new Logger(DatamuseService.name);
  private readonly breaker: CircuitBreaker<[string], DatamuseWord[]>;

  constructor(private readonly redis: RedisService) {
    this.breaker = new CircuitBreaker(this.fetchWords.bind(this), {
      timeout: 5_000,
      errorThresholdPercentage: 50,
      volumeThreshold: 5,
      resetTimeout: 30_000,
    });

    this.breaker.on('open', () =>
      this.logger.warn('Datamuse circuit breaker OPEN'),
    );
    this.breaker.on('close', () =>
      this.logger.log('Datamuse circuit breaker CLOSED'),
    );
  }

  // ── Public API ─────────────────────────────────────────────────────

  /** Words with similar meaning, enriched with frequency + CEFR level. */
  async meansLike(word: string, max = DEFAULT_MAX): Promise<RatedWord[]> {
    const params = `ml=${enc(word)}&md=fp&max=${max}`;
    const raw = await this.query('meanslike', word, params);
    return raw.map(toRated);
  }

  /** Synonyms of a word. */
  async synonyms(word: string, max = DEFAULT_MAX): Promise<RatedWord[]> {
    const params = `rel_syn=${enc(word)}&md=fp&max=${max}`;
    const raw = await this.query('syn', word, params);
    return raw.map(toRated);
  }

  /** Antonyms of a word. */
  async antonyms(word: string, max = DEFAULT_MAX): Promise<RatedWord[]> {
    const params = `rel_ant=${enc(word)}&md=fp&max=${max}`;
    const raw = await this.query('ant', word, params);
    return raw.map(toRated);
  }

  /** Adjectives that commonly describe the given noun (collocations). */
  async adjectivesFor(noun: string, max = DEFAULT_MAX): Promise<RatedWord[]> {
    const params = `rel_jja=${enc(noun)}&md=fp&max=${max}`;
    const raw = await this.query('adj', noun, params);
    return raw.map(toRated);
  }

  /** Words related to a concept filtered by topic. */
  async byTopic(word: string, topic: string, max = DEFAULT_MAX): Promise<RatedWord[]> {
    const params = `ml=${enc(word)}&topics=${enc(topic)}&md=fp&max=${max}`;
    const raw = await this.query(`topic:${topic}`, word, params);
    return raw.map(toRated);
  }

  /**
   * Returns words whose frequency (per million) falls within the given range.
   * Useful for generating vocabulary exercises filtered by CEFR level.
   */
  async byFrequency(
    word: string,
    minFreq: number,
    maxFreq: number,
    max = DEFAULT_MAX,
  ): Promise<RatedWord[]> {
    const all = await this.meansLike(word, 100);
    return all
      .filter((w) => w.frequencyPerMillion >= minFreq && w.frequencyPerMillion <= maxFreq)
      .slice(0, max);
  }

  /**
   * Returns words similar to `word` filtered to a specific CEFR level.
   * Convenient shorthand over `byFrequency`.
   */
  async byLevel(word: string, level: CefrLevel, max = DEFAULT_MAX): Promise<RatedWord[]> {
    const all = await this.meansLike(word, 100);
    return all.filter((w) => w.cefrLevel === level).slice(0, max);
  }

  /** Pings the API to verify connectivity. */
  async ping(): Promise<{ status: 'ok' | 'error'; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.fetchWords(`${BASE_URL}/words?ml=hello&max=1`);
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch {
      return { status: 'error', latencyMs: Date.now() - start };
    }
  }

  // ── Private helpers ────────────────────────────────────────────────

  private async query(
    queryType: string,
    word: string,
    params: string,
  ): Promise<DatamuseWord[]> {
    const cacheKey = `datamuse:${queryType}:${word.toLowerCase().trim()}`;

    const cached = await this.redis.getJson<DatamuseWord[]>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`Cache MISS ${cacheKey} — calling API`);
    const url = `${BASE_URL}/words?${params}`;
    const results = await this.breaker.fire(url);

    await this.redis.setJson(cacheKey, results, CACHE_TTL_SECONDS);
    return results;
  }

  private async fetchWords(url: string): Promise<DatamuseWord[]> {
    return withRetry(
      async () => {
        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} from Datamuse`);
        }

        return (await response.json()) as DatamuseWord[];
      },
      { attempts: 3, baseDelayMs: 500, label: 'Datamuse' },
    );
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function enc(s: string): string {
  return encodeURIComponent(s);
}

function toRated(w: DatamuseWord): RatedWord {
  const frequencyPerMillion = parseFrequencyTag(w.tags);
  return {
    ...w,
    frequencyPerMillion,
    cefrLevel: frequencyToCefrLevel(frequencyPerMillion),
  };
}
