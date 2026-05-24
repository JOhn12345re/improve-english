import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LanguageToolService } from './languagetool.service';
import { RedisService } from '../../../common/cache/redis.service';
import { CorrectionResult } from './languagetool.types';

// ── Fixtures ───────────────────────────────────────────────────────────────

const MATCH = {
  message: 'Possible typo: you repeated a word',
  shortMessage: 'Word repetition',
  offset: 4,
  length: 3,
  replacements: [{ value: 'the' }],
  context: { text: 'I am am happy', offset: 4, length: 3 },
  rule: { id: 'ENGLISH_WORD_REPEAT_RULE', description: 'Repeated word', category: { id: 'TYPOS', name: 'Possible Typos' } },
};

const LT_RESPONSE_WITH_ERROR = { matches: [MATCH] };
const LT_RESPONSE_CLEAN = { matches: [] };

// ── Mocks ──────────────────────────────────────────────────────────────────

const redisMock = { getJson: jest.fn(), setJson: jest.fn() };
const configMock = { get: jest.fn().mockImplementation((key: string, def: string) => def) };

function mockFetch(body: unknown, status = 200): void {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('LanguageToolService', () => {
  let service: LanguageToolService;

  beforeEach(async () => {
    global.fetch = jest.fn() as unknown as typeof fetch;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguageToolService,
        { provide: RedisService, useValue: redisMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<LanguageToolService>(LanguageToolService);
    jest.clearAllMocks();
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  // ── check() ────────────────────────────────────────────────────────────

  describe('check()', () => {
    it('returns CorrectionResult with matches on error text (cache miss)', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(LT_RESPONSE_WITH_ERROR);

      const result = await service.check('I am am happy');

      expect(result.isCorrect).toBe(false);
      expect(result.errorCount).toBe(1);
      expect(result.matches[0].rule.id).toBe('ENGLISH_WORD_REPEAT_RULE');
    });

    it('returns isCorrect=true for clean text', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(LT_RESPONSE_CLEAN);

      const result = await service.check('Hello, world!');

      expect(result.isCorrect).toBe(true);
      expect(result.errorCount).toBe(0);
      expect(result.matches).toHaveLength(0);
    });

    it('returns cached result without calling API', async () => {
      const cached: CorrectionResult = {
        text: 'Hello',
        language: 'en-US',
        matches: [],
        errorCount: 0,
        isCorrect: true,
      };
      redisMock.getJson.mockResolvedValueOnce(cached);

      const result = await service.check('Hello');

      expect(result).toBe(cached);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('stores result in Redis on cache miss', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(LT_RESPONSE_CLEAN);

      await service.check('Hello');

      expect(redisMock.setJson).toHaveBeenCalledWith(
        expect.stringMatching(/^lt:/),
        expect.objectContaining({ isCorrect: true }),
        expect.any(Number),
      );
    });

    it('uses a different cache key for different languages', async () => {
      redisMock.getJson.mockResolvedValue(null);
      redisMock.setJson.mockResolvedValue(undefined);
      mockFetch(LT_RESPONSE_CLEAN);
      mockFetch(LT_RESPONSE_CLEAN);

      await service.check('Hello', 'en-US');
      await service.check('Hello', 'fr-FR');

      const key1 = redisMock.setJson.mock.calls[0][0] as string;
      const key2 = redisMock.setJson.mock.calls[1][0] as string;
      expect(key1).not.toBe(key2);
    });

    it('posts as application/x-www-form-urlencoded', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(LT_RESPONSE_CLEAN);

      await service.check('Test sentence', 'en-US');

      const callArgs = (fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].headers['Content-Type']).toBe('application/x-www-form-urlencoded');
      expect(callArgs[1].body).toContain('text=Test+sentence');
      expect(callArgs[1].body).toContain('language=en-US');
    });

    it('throws after retries on HTTP error', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      mockFetch(null, 503);

      await expect(service.check('Hello')).rejects.toThrow();
    }, 15_000);

    it('throws after retries on network failure', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      (global.fetch as jest.Mock).mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(service.check('Hello')).rejects.toThrow();
    }, 15_000);
  });

  // ── ping() ────────────────────────────────────────────────────────────

  describe('ping()', () => {
    it('returns ok when API responds', async () => {
      mockFetch(LT_RESPONSE_CLEAN);
      const result = await service.ping();
      expect(result.status).toBe('ok');
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('returns error when API is down', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection refused'));
      const result = await service.ping();
      expect(result.status).toBe('error');
    }, 15_000);
  });
});
