import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RedisService } from '../../../common/cache/redis.service';
import { CefrLevel } from '@englishflow/shared-types';
import { CefrLevel as PrismaCefrLevel, IngestionStatus } from '@prisma/client';
import { frequencyToCefrLevel } from '../../integrations/datamuse/level-mapper.util';

const CACHE_TTL = 60 * 60 * 24 * 30; // 30 days
const DATAMUSE_BASE = 'https://api.datamuse.com';
const LEVEL_ORDER: CefrLevel[] = [
  CefrLevel.A1, CefrLevel.A2, CefrLevel.B1,
  CefrLevel.B2, CefrLevel.C1, CefrLevel.C2,
];

export interface ClassifierSignals {
  avgWordFreq: number;
  avgSentenceLength: number;
  lexicalDiversity: number;
  grammarComplexity: number;
}

export interface ClassificationResult {
  level: CefrLevel;
  confidence: number;
  signals: ClassifierSignals;
}

@Injectable()
export class CecrlClassifierService {
  private readonly logger = new Logger(CecrlClassifierService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Classifies a text into a CEFR level using 4 weighted signals:
   *  - Average word frequency (Datamuse) — 50%
   *  - Average sentence length          — 25%
   *  - Lexical diversity                — 15%
   *  - Grammar complexity               — 10%
   */
  async classify(text: string): Promise<ClassificationResult> {
    const words = tokenize(text);
    const sentences = splitSentences(text);

    if (words.length === 0) {
      return { level: CefrLevel.B1, confidence: 0, signals: { avgWordFreq: 0, avgSentenceLength: 0, lexicalDiversity: 0, grammarComplexity: 0 } };
    }

    const avgWordFreq = await this.computeAverageFrequency(words);
    const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : words.length;
    const lexicalDiversity = new Set(words.map((w) => w.toLowerCase())).size / words.length;
    const grammarComplexity = detectGrammarComplexity(text);

    // Map each signal to a 0–5 index (A1=0 … C2=5)
    const freqIdx  = LEVEL_ORDER.indexOf(frequencyToCefrLevel(avgWordFreq));
    const sentIdx  = sentenceLengthToIndex(avgSentenceLength);
    const lexIdx   = lexicalDiversityToIndex(lexicalDiversity);
    const gramIdx  = Math.round(grammarComplexity * 5);

    // Weighted average
    const rawIdx =
      freqIdx  * 0.50 +
      sentIdx  * 0.25 +
      lexIdx   * 0.15 +
      gramIdx  * 0.10;

    const clampedIdx = Math.max(0, Math.min(5, Math.round(rawIdx)));
    const level = LEVEL_ORDER[clampedIdx];

    // Confidence: agreement across signals (lower stddev → higher confidence)
    const indices = [freqIdx, sentIdx, lexIdx, gramIdx];
    const mean = indices.reduce((a, b) => a + b, 0) / indices.length;
    const variance = indices.reduce((s, x) => s + (x - mean) ** 2, 0) / indices.length;
    const confidence = Math.max(0, Math.min(1, 1 - Math.sqrt(variance) / 3));

    return {
      level,
      confidence,
      signals: { avgWordFreq, avgSentenceLength, lexicalDiversity, grammarComplexity },
    };
  }

  /** Classifies a batch of RawContent IDs and updates the DB. */
  async classifyBatch(ids: string[]): Promise<void> {
    for (const id of ids) {
      try {
        const raw = await this.prisma.rawContent.findUnique({ where: { id } });
        if (!raw || raw.status !== IngestionStatus.PENDING) continue;

        const result = await this.classify(raw.text);

        await this.prisma.rawContent.update({
          where: { id },
          data: {
            detected_level: result.level as unknown as PrismaCefrLevel,
            avg_word_freq: result.signals.avgWordFreq,
            status: IngestionStatus.CLASSIFIED,
            processed_at: new Date(),
          },
        });

        this.logger.debug(`Classified ${id} → ${result.level} (confidence: ${result.confidence.toFixed(2)})`);
      } catch (err) {
        this.logger.warn(`Failed to classify ${id}: ${(err as Error).message}`);
        await this.prisma.rawContent.update({
          where: { id },
          data: { status: IngestionStatus.FAILED },
        }).catch(() => {});
      }
    }
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private async computeAverageFrequency(words: string[]): Promise<number> {
    // Sample max 80 unique content words to limit API calls
    const unique = [...new Set(words.map((w) => w.toLowerCase()))]
      .filter((w) => w.length > 3 && !STOPWORDS.has(w))
      .slice(0, 80);

    if (unique.length === 0) return 10; // fallback B1

    const freqs = await Promise.all(unique.map((w) => this.getWordFrequency(w)));
    const valid = freqs.filter((f) => f > 0);
    return valid.length > 0
      ? valid.reduce((a, b) => a + b, 0) / valid.length
      : 10;
  }

  private async getWordFrequency(word: string): Promise<number> {
    const key = `datamuse:freq:${word}`;
    const cached = await this.redis.get(key);
    if (cached !== null) return parseFloat(cached);

    try {
      const res = await fetch(
        `${DATAMUSE_BASE}/words?sp=${encodeURIComponent(word)}&md=f&max=1`,
        { signal: AbortSignal.timeout(3_000) },
      );
      if (!res.ok) return 0;
      const data = (await res.json()) as Array<{ word: string; tags?: string[] }>;
      const tag = data[0]?.tags?.find((t) => t.startsWith('f:'));
      const freq = tag ? parseFloat(tag.slice(2)) : 0;
      await this.redis.set(key, String(freq), CACHE_TTL);
      return isNaN(freq) ? 0 : freq;
    } catch {
      return 0;
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text.match(/\b[a-zA-Z]{2,}\b/g) ?? [];
}

function splitSentences(text: string): string[] {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
}

function sentenceLengthToIndex(avgLen: number): number {
  // A1 ≤ 8 words, A2 ≤ 12, B1 ≤ 16, B2 ≤ 22, C1 ≤ 30, C2 > 30
  if (avgLen <= 8)  return 0;
  if (avgLen <= 12) return 1;
  if (avgLen <= 16) return 2;
  if (avgLen <= 22) return 3;
  if (avgLen <= 30) return 4;
  return 5;
}

function lexicalDiversityToIndex(diversity: number): number {
  // A1 ≤ 0.40, A2 ≤ 0.50, B1 ≤ 0.60, B2 ≤ 0.70, C1 ≤ 0.80, C2 > 0.80
  if (diversity <= 0.40) return 0;
  if (diversity <= 0.50) return 1;
  if (diversity <= 0.60) return 2;
  if (diversity <= 0.70) return 3;
  if (diversity <= 0.80) return 4;
  return 5;
}

/** Returns a 0–1 score: 0 = simple, 1 = very complex grammar. */
function detectGrammarComplexity(text: string): number {
  const lower = text.toLowerCase();
  let score = 0;

  // Subordinating conjunctions
  if (/\b(although|whereas|despite|nevertheless|furthermore|consequently)\b/.test(lower)) score += 0.3;
  // Passive voice
  if (/\b(is|are|was|were|been|being)\s+(being\s+)?\w+ed\b/.test(lower)) score += 0.2;
  // Modal verbs (advanced)
  if (/\b(might|ought|could have|should have|would have)\b/.test(lower)) score += 0.2;
  // Relative clauses
  if (/\b(which|whom|whose)\b/.test(lower)) score += 0.15;
  // Conditionals
  if (/\b(if|unless|provided that|as long as)\b/.test(lower)) score += 0.15;

  return Math.min(1, score);
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'have', 'from',
  'they', 'their', 'what', 'will', 'been', 'has', 'had', 'but',
  'are', 'was', 'were', 'not', 'all', 'one', 'can', 'more',
  'also', 'into', 'its', 'which', 'about', 'out', 'when',
]);
