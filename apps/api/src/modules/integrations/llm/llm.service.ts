import { createHash } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import CircuitBreaker from 'opossum';
import { RedisService } from '../../../common/cache/redis.service';
import { withRetry } from '../../../common/http/retry.util';
import {
  GroqChatResponse,
  LlmMessage,
  LlmOptions,
  LlmResult,
} from './llm.types';

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const MAX_TOKENS_DEFAULT = 2_000;
const TEMPERATURE_DEFAULT = 0.7;

// Groq REST endpoint (OpenAI-compatible)
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly groqApiKey: string;
  private readonly groqModel: string;
  private readonly anthropicApiKey: string;
  private readonly anthropic: Anthropic | null;

  private readonly groqBreaker: CircuitBreaker<[LlmCallParams], LlmResult>;
  private readonly anthropicBreaker: CircuitBreaker<[LlmCallParams], LlmResult>;

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    this.groqApiKey = config.get<string>('groq.apiKey', '');
    this.groqModel = config.get<string>('groq.model', 'llama-3.3-70b-versatile');
    this.anthropicApiKey = config.get<string>('anthropic.apiKey', '');

    this.anthropic = this.anthropicApiKey
      ? new Anthropic({ apiKey: this.anthropicApiKey })
      : null;

    this.groqBreaker = new CircuitBreaker(this.callGroq.bind(this), {
      timeout: 30_000,
      errorThresholdPercentage: 50,
      volumeThreshold: 5,
      resetTimeout: 60_000,
    });
    this.anthropicBreaker = new CircuitBreaker(this.callAnthropic.bind(this), {
      timeout: 30_000,
      errorThresholdPercentage: 50,
      volumeThreshold: 5,
      resetTimeout: 60_000,
    });

    for (const [name, cb] of [
      ['Groq', this.groqBreaker],
      ['Anthropic', this.anthropicBreaker],
    ] as const) {
      cb.on('open', () => this.logger.warn(`${name} circuit breaker OPEN`));
      cb.on('close', () => this.logger.log(`${name} circuit breaker CLOSED`));
    }
  }

  /**
   * Generates a response from an LLM.
   *
   * Routing:
   *   - isPremium=true + Anthropic key configured → Claude Haiku
   *   - Otherwise → Groq LLaMA 3.3 70B
   *
   * Caching:
   *   - Single-turn (no history, skipCache=false) → cached 7 days
   *   - Conversation mode (history provided) → never cached
   *
   * Token guard: maxTokens capped at 2000 by default.
   */
  async generate(prompt: string, options: LlmOptions = {}): Promise<LlmResult> {
    const {
      isPremium = false,
      maxTokens = MAX_TOKENS_DEFAULT,
      temperature = TEMPERATURE_DEFAULT,
      systemPrompt,
      history = [],
      skipCache = false,
      model,
    } = options;

    const isConversation = history.length > 0;
    const useCache = !isConversation && !skipCache;

    const useAnthropic = isPremium && !!this.anthropic;
    const provider = useAnthropic ? 'anthropic' : 'groq';

    // Cache lookup
    if (useCache) {
      const cacheKey = this.cacheKey(provider, systemPrompt ?? '', prompt, maxTokens, temperature);
      const cached = await this.redis.getJson<LlmResult>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache HIT LLM ${cacheKey.slice(0, 40)}…`);
        return { ...cached, fromCache: true };
      }
    }

    const params: LlmCallParams = {
      prompt,
      systemPrompt,
      history,
      maxTokens: Math.min(maxTokens, MAX_TOKENS_DEFAULT),
      temperature,
      model,
    };

    const result = useAnthropic
      ? await this.anthropicBreaker.fire(params)
      : await this.groqBreaker.fire(params);

    // Store in cache (single-turn only)
    if (useCache) {
      const cacheKey = this.cacheKey(provider, systemPrompt ?? '', prompt, maxTokens, temperature);
      await this.redis.setJson(cacheKey, result, CACHE_TTL_SECONDS);
    }

    return result;
  }

  /** Pings both providers and returns their availability. */
  async ping(): Promise<{
    groq: { status: 'ok' | 'error' | 'skipped'; latencyMs: number };
    anthropic: { status: 'ok' | 'error' | 'skipped'; latencyMs: number };
  }> {
    const groqResult = this.groqApiKey
      ? await this.timePing(() =>
          this.callGroq({ prompt: 'ping', maxTokens: 5, temperature: 0 }),
        )
      : { status: 'skipped' as const, latencyMs: 0 };

    const anthropicResult = this.anthropic
      ? await this.timePing(() =>
          this.callAnthropic({ prompt: 'ping', maxTokens: 5, temperature: 0 }),
        )
      : { status: 'skipped' as const, latencyMs: 0 };

    return { groq: groqResult, anthropic: anthropicResult };
  }

  // ── Private — Groq ────────────────────────────────────────────────────────

  private async callGroq(params: LlmCallParams): Promise<LlmResult> {
    const model = params.model ?? this.groqModel;

    return withRetry(
      async () => {
        const messages = buildMessages(params);

        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.groqApiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: params.maxTokens,
            temperature: params.temperature,
          }),
        });

        if (!response.ok) {
          const body = await response.text().catch(() => '');
          throw new Error(`HTTP ${response.status} from Groq: ${body}`);
        }

        const data = (await response.json()) as GroqChatResponse;
        const text = data.choices?.[0]?.message?.content?.trim();

        if (!text) throw new Error('Groq returned empty content');

        return {
          text,
          provider: 'groq',
          model: data.model ?? model,
          totalTokens: data.usage?.total_tokens,
          fromCache: false,
        };
      },
      { attempts: 3, baseDelayMs: 1_000, label: 'Groq' },
    );
  }

  // ── Private — Anthropic ───────────────────────────────────────────────────

  private async callAnthropic(params: LlmCallParams): Promise<LlmResult> {
    if (!this.anthropic) throw new Error('Anthropic client not initialised');

    // Default: Haiku (fast + cheap). Sonnet for conversation (history present).
    const model =
      params.model ??
      (params.history?.length ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001');

    return withRetry(
      async () => {
        const messages = buildMessages(params) as Anthropic.MessageParam[];

        const response = await this.anthropic!.messages.create({
          model,
          max_tokens: params.maxTokens ?? MAX_TOKENS_DEFAULT,
          system: params.systemPrompt,
          messages,
        });

        const block = response.content.find((b) => b.type === 'text');
        const text = block?.type === 'text' ? block.text.trim() : '';

        if (!text) throw new Error('Anthropic returned empty content');

        return {
          text,
          provider: 'anthropic',
          model,
          totalTokens:
            (response.usage.input_tokens ?? 0) + (response.usage.output_tokens ?? 0),
          fromCache: false,
        };
      },
      { attempts: 3, baseDelayMs: 1_000, label: 'Anthropic' },
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private cacheKey(
    provider: string,
    systemPrompt: string,
    prompt: string,
    maxTokens: number,
    temperature: number,
  ): string {
    const hash = createHash('sha256')
      .update(`${provider}|${systemPrompt}|${prompt}|${maxTokens}|${temperature}`)
      .digest('hex');
    return `llm:${provider}:${hash}`;
  }

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

// ── Shared helpers ─────────────────────────────────────────────────────────

interface LlmCallParams {
  prompt: string;
  systemPrompt?: string;
  history?: LlmMessage[];
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

function buildMessages(params: LlmCallParams): LlmMessage[] {
  return [
    ...(params.history ?? []),
    { role: 'user', content: params.prompt },
  ];
}
