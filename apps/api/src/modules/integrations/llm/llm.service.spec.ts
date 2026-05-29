import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LlmService } from './llm.service';
import { RedisService } from '../../../common/cache/redis.service';
import { LlmResult } from './llm.types';

// ── Anthropic SDK mock ─────────────────────────────────────────────────────

const mockAnthropicCreate = jest.fn();
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: { create: mockAnthropicCreate },
  }));
});

// ── Mocks ──────────────────────────────────────────────────────────────────

const redisMock = { getJson: jest.fn(), setJson: jest.fn() };

const configValues: Record<string, string> = {
  'groq.apiKey': 'gsk_test',
  'groq.model': 'llama-3.3-70b-versatile',
  'anthropic.apiKey': 'sk-ant-test',
};
const configMock = {
  get: jest.fn((key: string, def = '') => configValues[key] ?? def),
};

function mockFetch(body: unknown, status = 200, times = 1): void {
  if (!jest.isMockFunction(global.fetch)) {
    global.fetch = jest.fn() as unknown as typeof fetch;
  }
  for (let i = 0; i < times; i++) {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(body),
      json: async () => body,
    });
  }
}

const GROQ_OK: object = {
  choices: [{ message: { role: 'assistant', content: 'Paris.' }, finish_reason: 'stop' }],
  usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
  model: 'llama-3.3-70b-versatile',
};

const ANTHROPIC_OK: object = {
  content: [{ type: 'text', text: 'Paris.' }],
  model: 'claude-haiku-4-5-20251001',
  usage: { input_tokens: 10, output_tokens: 5 },
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('LlmService', () => {
  let service: LlmService;

  beforeEach(async () => {
    mockAnthropicCreate.mockResolvedValue(ANTHROPIC_OK);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmService,
        { provide: RedisService, useValue: redisMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<LlmService>(LlmService);
    jest.clearAllMocks();
    redisMock.getJson.mockReset();
    redisMock.setJson.mockReset();
    mockAnthropicCreate.mockResolvedValue(ANTHROPIC_OK);
  });

  // ── generate — Groq (free) ───────────────────────────────────────────

  describe('generate() — Groq (free)', () => {
    it('returns an LlmResult via Groq on cache miss', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(GROQ_OK);

      const result = await service.generate('What is the capital of France?');

      expect(result.text).toBe('Paris.');
      expect(result.provider).toBe('groq');
      expect(result.fromCache).toBe(false);
      expect(result.totalTokens).toBe(15);
    });

    it('sends Bearer token in Authorization header', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(GROQ_OK);

      await service.generate('hello');

      const headers = (fetch as jest.Mock).mock.calls[0][1].headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer gsk_test');
    });

    it('caps maxTokens at 2000', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(GROQ_OK);

      await service.generate('hello', { maxTokens: 9999 });

      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body as string);
      expect(body.max_tokens).toBe(2000);
    });

    it('includes history messages before the prompt', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(GROQ_OK);

      await service.generate('And Berlin?', {
        history: [
          { role: 'user', content: 'Capital of France?' },
          { role: 'assistant', content: 'Paris.' },
        ],
      });

      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body as string);
      expect(body.messages).toHaveLength(3);
      expect(body.messages[0].content).toBe('Capital of France?');
      expect(body.messages[2].content).toBe('And Berlin?');
    });

    it('throws on HTTP error after retries', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429, text: async () => 'rate limited' }) as unknown as typeof fetch;

      await expect(service.generate('hello')).rejects.toThrow(/429/);
    }, 15_000);
  });

  // ── generate — Anthropic (premium) ───────────────────────────────────

  describe('generate() — Anthropic (premium)', () => {
    it('returns an LlmResult via Anthropic for premium users', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockAnthropicCreate.mockResolvedValueOnce(ANTHROPIC_OK);

      const result = await service.generate('Capital of France?', { isPremium: true });

      expect(result.text).toBe('Paris.');
      expect(result.provider).toBe('anthropic');
      expect(result.fromCache).toBe(false);
    });

    it('uses claude-sonnet model when history is provided (conversation mode)', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      mockAnthropicCreate.mockResolvedValueOnce(ANTHROPIC_OK);

      await service.generate('And Berlin?', {
        isPremium: true,
        history: [{ role: 'user', content: 'Capital of France?' }],
      });

      const callArgs = mockAnthropicCreate.mock.calls[0][0];
      expect(callArgs.model).toContain('opus');
    });

    it('falls back to Groq when Anthropic key is absent', async () => {
      const noKeyConfig = {
        get: jest.fn((key: string, def = '') => {
          if (key === 'anthropic.apiKey') return '';
          return configValues[key] ?? def;
        }),
      };
      const module = await Test.createTestingModule({
        providers: [
          LlmService,
          { provide: RedisService, useValue: redisMock },
          { provide: ConfigService, useValue: noKeyConfig },
        ],
      }).compile();
      const svc = module.get<LlmService>(LlmService);

      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(GROQ_OK);

      const result = await svc.generate('hello', { isPremium: true });
      expect(result.provider).toBe('groq');
    });
  });

  // ── caching ────────────────────────────────────────────────────────────

  describe('caching', () => {
    it('returns cached result without calling any API', async () => {
      const cached: LlmResult = {
        text: 'Paris.',
        provider: 'groq',
        model: 'llama',
        fromCache: true,
      };
      redisMock.getJson.mockResolvedValueOnce(cached);
      global.fetch = jest.fn() as unknown as typeof fetch;

      const result = await service.generate('Capital of France?');

      expect(result.fromCache).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('does NOT cache conversation-mode responses', async () => {
      mockFetch(GROQ_OK);

      await service.generate('And Berlin?', {
        history: [{ role: 'user', content: 'Paris is the capital' }],
      });

      expect(redisMock.getJson).not.toHaveBeenCalled();
      expect(redisMock.setJson).not.toHaveBeenCalled();
    });

    it('does NOT cache when skipCache=true', async () => {
      mockFetch(GROQ_OK);

      await service.generate('hello', { skipCache: true });

      expect(redisMock.setJson).not.toHaveBeenCalled();
    });

    it('stores result in Redis with 7-day TTL on cache miss', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(GROQ_OK);

      await service.generate('hello');

      const ttl = redisMock.setJson.mock.calls[0][2] as number;
      expect(ttl).toBe(60 * 60 * 24 * 7);
    });

    it('uses separate cache keys for different prompts', async () => {
      redisMock.getJson.mockResolvedValue(null);
      redisMock.setJson.mockResolvedValue(undefined);
      mockFetch(GROQ_OK);
      mockFetch(GROQ_OK);

      await service.generate('prompt A');
      await service.generate('prompt B');

      const key1 = redisMock.setJson.mock.calls[0][0] as string;
      const key2 = redisMock.setJson.mock.calls[1][0] as string;
      expect(key1).not.toBe(key2);
    });
  });

  // ── ping ──────────────────────────────────────────────────────────────

  describe('ping()', () => {
    it('returns ok for both providers when configured', async () => {
      mockFetch(GROQ_OK);
      mockAnthropicCreate.mockResolvedValueOnce(ANTHROPIC_OK);

      const result = await service.ping();
      expect(result.groq.status).toBe('ok');
      expect(result.anthropic.status).toBe('ok');
    });

    it('returns skipped for anthropic when no key configured', async () => {
      const noKeyConfig = {
        get: jest.fn((key: string, def = '') => {
          if (key === 'anthropic.apiKey') return '';
          return configValues[key] ?? def;
        }),
      };
      const module = await Test.createTestingModule({
        providers: [
          LlmService,
          { provide: RedisService, useValue: redisMock },
          { provide: ConfigService, useValue: noKeyConfig },
        ],
      }).compile();
      const svc = module.get<LlmService>(LlmService);

      mockFetch(GROQ_OK);
      const result = await svc.ping();
      expect(result.anthropic.status).toBe('skipped');
    });

    it('returns error for groq when API is down', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;
      mockAnthropicCreate.mockResolvedValueOnce(ANTHROPIC_OK);

      const result = await service.ping();
      expect(result.groq.status).toBe('error');
    }, 15_000);
  });
});
