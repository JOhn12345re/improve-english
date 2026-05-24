import { Test, TestingModule } from '@nestjs/testing';
import { DatamuseService } from './datamuse.service';
import { RedisService } from '../../../common/cache/redis.service';
import { CefrLevel } from '@englishflow/shared-types';
import { DatamuseWord } from './datamuse.types';

// ── Fixtures ───────────────────────────────────────────────────────────────

const API_WORDS: DatamuseWord[] = [
  { word: 'happy',   score: 3000, tags: ['adj', 'f:55.2'] },  // A1
  { word: 'joyful',  score: 2000, tags: ['adj', 'f:6.1'] },   // B1
  { word: 'elated',  score: 1000, tags: ['adj', 'f:1.8'] },   // C1
  { word: 'exultant',score: 500,  tags: ['adj', 'f:0.3'] },   // C2
];

// ── Mocks ──────────────────────────────────────────────────────────────────

const redisMock = {
  getJson: jest.fn(),
  setJson: jest.fn(),
};

function mockFetch(body: unknown, status = 200): void {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as unknown as typeof fetch;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('DatamuseService', () => {
  let service: DatamuseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatamuseService,
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();

    service = module.get<DatamuseService>(DatamuseService);
    jest.clearAllMocks();
  });

  // ── meansLike ──────────────────────────────────────────────────────────

  describe('meansLike()', () => {
    it('returns RatedWord array enriched with frequency + CEFR level', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(API_WORDS);

      const result = await service.meansLike('happy');

      expect(result).toHaveLength(4);
      expect(result[0].word).toBe('happy');
      expect(result[0].frequencyPerMillion).toBeCloseTo(55.2);
      expect(result[0].cefrLevel).toBe(CefrLevel.A1);
      expect(result[2].cefrLevel).toBe(CefrLevel.C1);
    });

    it('returns cached results without calling fetch', async () => {
      redisMock.getJson.mockResolvedValueOnce(API_WORDS);
      global.fetch = jest.fn() as unknown as typeof fetch;

      const result = await service.meansLike('happy');

      expect(result).toHaveLength(4);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('stores results in Redis on cache miss', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(API_WORDS);

      await service.meansLike('happy');

      expect(redisMock.setJson).toHaveBeenCalledWith(
        'datamuse:meanslike:happy',
        API_WORDS,
        expect.any(Number),
      );
    });

    it('throws on API error after retries', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      global.fetch = jest.fn().mockRejectedValue(new Error('Network down')) as unknown as typeof fetch;

      await expect(service.meansLike('happy')).rejects.toThrow();
    }, 15_000);
  });

  // ── synonyms ───────────────────────────────────────────────────────────

  describe('synonyms()', () => {
    it('calls the rel_syn endpoint', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(API_WORDS.slice(0, 2));

      const result = await service.synonyms('happy');

      expect(result).toHaveLength(2);
      const calledUrl = (fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toContain('rel_syn=happy');
    });
  });

  // ── antonyms ───────────────────────────────────────────────────────────

  describe('antonyms()', () => {
    it('calls the rel_ant endpoint', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch([{ word: 'sad', score: 1000, tags: ['adj', 'f:30.0'] }]);

      const result = await service.antonyms('happy');

      expect(result[0].word).toBe('sad');
      const calledUrl = (fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toContain('rel_ant=happy');
    });
  });

  // ── adjectivesFor ──────────────────────────────────────────────────────

  describe('adjectivesFor()', () => {
    it('calls the rel_jja endpoint', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch([{ word: 'big', score: 500, tags: ['adj', 'f:40.0'] }]);

      await service.adjectivesFor('dog');

      const calledUrl = (fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toContain('rel_jja=dog');
    });
  });

  // ── byLevel ────────────────────────────────────────────────────────────

  describe('byLevel()', () => {
    it('filters words to the requested CEFR level', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(API_WORDS);

      const result = await service.byLevel('happy', CefrLevel.A1);

      expect(result.every((w) => w.cefrLevel === CefrLevel.A1)).toBe(true);
    });
  });

  // ── byFrequency ────────────────────────────────────────────────────────

  describe('byFrequency()', () => {
    it('filters words by frequency range', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(API_WORDS);

      const result = await service.byFrequency('happy', 1, 10);

      // Only 'joyful' (6.1) and 'elated' (1.8) fall in [1, 10]
      expect(result.every((w) => w.frequencyPerMillion >= 1 && w.frequencyPerMillion <= 10)).toBe(true);
    });
  });

  // ── ping ──────────────────────────────────────────────────────────────

  describe('ping()', () => {
    it('returns ok when API responds', async () => {
      mockFetch([{ word: 'hello', score: 100 }]);
      const result = await service.ping();
      expect(result.status).toBe('ok');
    });

    it('returns error when API is down', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('timeout')) as unknown as typeof fetch;
      const result = await service.ping();
      expect(result.status).toBe('error');
    }, 15_000);
  });
});
