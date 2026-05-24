import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TranslationService } from './translation.service';
import { RedisService } from '../../../common/cache/redis.service';
import { TranslationResult } from './translation.types';

// ── Mocks ──────────────────────────────────────────────────────────────────

const redisMock = { getJson: jest.fn(), setJson: jest.fn() };

const configValues: Record<string, string> = {
  'deepl.apiKey': 'test-deepl-key',
  'deepl.apiUrl': 'https://api-free.deepl.com/v2',
};
const configMock = {
  get: jest.fn((key: string, def = '') => configValues[key] ?? def),
};

/** Queues one response on the shared fetch mock. */
function mockFetch(body: unknown, status = 200, times = 1): void {
  for (let i = 0; i < times; i++) {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(body),
      json: async () => body,
    });
  }
}

const MY_MEMORY_OK = {
  responseStatus: 200,
  responseData: { translatedText: 'Hello', match: 1 },
};

const DEEPL_OK = {
  translations: [{ detected_source_language: 'FR', text: 'Hello' }],
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(async () => {
    global.fetch = jest.fn() as unknown as typeof fetch;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranslationService,
        { provide: RedisService, useValue: redisMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<TranslationService>(TranslationService);
    jest.clearAllMocks();
    global.fetch = jest.fn() as unknown as typeof fetch;
    // restore default config behaviour after clearAllMocks resets it
    configMock.get.mockImplementation((key: string, def = '') => configValues[key] ?? def);
  });

  // ── translate — MyMemory (free) ──────────────────────────────────────

  describe('translate() — MyMemory (free tier)', () => {
    it('returns a TranslationResult via MyMemory on cache miss', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(MY_MEMORY_OK);

      const result = await service.translate('Bonjour', 'fr', 'en', false);

      expect(result.translatedText).toBe('Hello');
      expect(result.provider).toBe('mymemory');
      expect(result.sourceLang).toBe('fr');
      expect(result.targetLang).toBe('en');
    });

    it('hits MyMemory URL with correct langpair param', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(MY_MEMORY_OK);

      await service.translate('Bonjour', 'fr', 'en', false);

      const url = (fetch as jest.Mock).mock.calls[0][0] as string;
      // MyMemory accepts both literal | and %7C; test for either
      expect(url).toMatch(/langpair=fr[|%7C]en/i);
      expect(url).toContain('q=Bonjour');
    });

    it('throws when MyMemory quota is exceeded', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      mockFetch({ responseStatus: 200, responseData: { translatedText: '' }, quotaFinished: true }, 200, 3);

      await expect(service.translate('hi', 'en', 'fr', false)).rejects.toThrow(/quota/i);
    }, 15_000);

    it('throws on non-200 responseStatus from MyMemory', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      mockFetch({ responseStatus: 403, responseData: { translatedText: '' } }, 200, 3);

      await expect(service.translate('hi', 'en', 'fr', false)).rejects.toThrow(/403/);
    }, 15_000);
  });

  // ── translate — DeepL (premium) ───────────────────────────────────────

  describe('translate() — DeepL (premium tier)', () => {
    it('returns a TranslationResult via DeepL for premium users', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(DEEPL_OK);

      const result = await service.translate('Bonjour', 'fr', 'en', true);

      expect(result.translatedText).toBe('Hello');
      expect(result.provider).toBe('deepl');
    });

    it('sends correct Authorization header to DeepL', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(DEEPL_OK);

      await service.translate('Bonjour', 'fr', 'en', true);

      const callOpts = (fetch as jest.Mock).mock.calls[0][1] as RequestInit;
      expect((callOpts.headers as Record<string, string>)['Authorization']).toBe(
        'DeepL-Auth-Key test-deepl-key',
      );
    });

    it('uppercases language codes for DeepL', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(DEEPL_OK);

      await service.translate('Bonjour', 'fr', 'en', true);

      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body as string);
      expect(body.source_lang).toBe('FR');
      expect(body.target_lang).toBe('EN');
    });

    it('falls back to MyMemory when DeepL key is absent', async () => {
      const noKeyConfig = {
        get: jest.fn((key: string, def = '') => {
          if (key === 'deepl.apiKey') return '';
          return configValues[key] ?? def;
        }),
      };
      const module = await Test.createTestingModule({
        providers: [
          TranslationService,
          { provide: RedisService, useValue: redisMock },
          { provide: ConfigService, useValue: noKeyConfig },
        ],
      }).compile();
      const svc = module.get<TranslationService>(TranslationService);

      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(MY_MEMORY_OK);

      const result = await svc.translate('Bonjour', 'fr', 'en', true);
      expect(result.provider).toBe('mymemory');
    });
  });

  // ── cache ─────────────────────────────────────────────────────────────

  describe('caching', () => {
    it('returns cached result without calling fetch', async () => {
      const cached: TranslationResult = {
        originalText: 'Bonjour',
        translatedText: 'Hello',
        sourceLang: 'fr',
        targetLang: 'en',
        provider: 'mymemory',
      };
      redisMock.getJson.mockResolvedValueOnce(cached);

      const result = await service.translate('Bonjour', 'fr', 'en', false);

      expect(result).toBe(cached);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('uses separate cache keys for free and premium', async () => {
      redisMock.getJson.mockResolvedValue(null);
      redisMock.setJson.mockResolvedValue(undefined);
      mockFetch(MY_MEMORY_OK);
      mockFetch(DEEPL_OK);

      await service.translate('Bonjour', 'fr', 'en', false);
      await service.translate('Bonjour', 'fr', 'en', true);

      const key1 = redisMock.setJson.mock.calls[0][0] as string;
      const key2 = redisMock.setJson.mock.calls[1][0] as string;
      expect(key1).toContain('mymemory');
      expect(key2).toContain('deepl');
    });

    it('stores result with 90-day TTL', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(MY_MEMORY_OK);

      await service.translate('hello', 'en', 'fr', false);

      const ttl = redisMock.setJson.mock.calls[0][2] as number;
      expect(ttl).toBe(60 * 60 * 24 * 90);
    });
  });

  // ── ping ──────────────────────────────────────────────────────────────

  describe('ping()', () => {
    it('returns ok for mymemory when API responds', async () => {
      mockFetch(MY_MEMORY_OK);
      mockFetch(DEEPL_OK);

      const result = await service.ping();

      expect(result.mymemory.status).toBe('ok');
      expect(result.deepl.status).toBe('ok');
    });

    it('returns error for mymemory when down', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('offline'));

      const result = await service.ping();

      expect(result.mymemory.status).toBe('error');
    }, 15_000);

    it('returns skipped for deepl when no API key is configured', async () => {
      const noKeyConfig = {
        get: jest.fn((key: string, def = '') => {
          if (key === 'deepl.apiKey') return '';
          return configValues[key] ?? def;
        }),
      };
      const module = await Test.createTestingModule({
        providers: [
          TranslationService,
          { provide: RedisService, useValue: redisMock },
          { provide: ConfigService, useValue: noKeyConfig },
        ],
      }).compile();
      const svc = module.get<TranslationService>(TranslationService);

      mockFetch(MY_MEMORY_OK);

      const result = await svc.ping();
      expect(result.deepl.status).toBe('skipped');
    });
  });
});
