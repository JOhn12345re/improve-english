import { Test, TestingModule } from '@nestjs/testing';
import { DictionaryService } from './dictionary.service';
import { RedisService } from '../../../common/cache/redis.service';
import { DictionaryEntry } from './dictionary.types';

// ── Fixtures ───────────────────────────────────────────────────────────────

const HELLO_ENTRY: DictionaryEntry = {
  word: 'hello',
  phonetic: '/həˈloʊ/',
  phonetics: [{ text: '/həˈloʊ/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3' }],
  meanings: [
    {
      partOfSpeech: 'exclamation',
      definitions: [
        { definition: 'Used as a greeting or to begin a phone conversation.', synonyms: [], antonyms: [] },
      ],
    },
  ],
  audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3',
};

const API_RESPONSE = [
  {
    word: 'hello',
    phonetic: '/həˈloʊ/',
    phonetics: [{ text: '/həˈloʊ/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3' }],
    meanings: [
      {
        partOfSpeech: 'exclamation',
        definitions: [{ definition: 'Used as a greeting or to begin a phone conversation.', synonyms: [], antonyms: [] }],
      },
    ],
  },
];

// ── Mock setup ─────────────────────────────────────────────────────────────

const redisMock = {
  getJson: jest.fn(),
  setJson: jest.fn(),
};

function mockFetch(status: number, body?: unknown): void {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as unknown as typeof fetch;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('DictionaryService', () => {
  let service: DictionaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DictionaryService,
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();

    service = module.get<DictionaryService>(DictionaryService);
    jest.clearAllMocks();
  });

  // ── lookup ───────────────────────────────────────────────────────────────

  describe('lookup()', () => {
    it('returns a DictionaryEntry on API success (cache miss)', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(200, API_RESPONSE);

      const result = await service.lookup('hello');

      expect(result).not.toBeNull();
      expect(result!.word).toBe('hello');
      expect(result!.phonetic).toBe('/həˈloʊ/');
      expect(result!.audioUrl).toMatch(/\.mp3$/);
    });

    it('stores the result in Redis after a cache miss', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(200, API_RESPONSE);

      await service.lookup('hello');

      expect(redisMock.setJson).toHaveBeenCalledWith(
        'dict:hello',
        expect.objectContaining({ word: 'hello' }),
        expect.any(Number),
      );
    });

    it('returns cached entry without calling fetch on cache hit', async () => {
      redisMock.getJson.mockResolvedValueOnce(HELLO_ENTRY);
      global.fetch = jest.fn() as unknown as typeof fetch;

      const result = await service.lookup('hello');

      expect(result).toBe(HELLO_ENTRY);
      expect(fetch).not.toHaveBeenCalled();
      expect(redisMock.setJson).not.toHaveBeenCalled();
    });

    it('normalises the cache key to lowercase', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      redisMock.setJson.mockResolvedValueOnce(undefined);
      mockFetch(200, API_RESPONSE);

      await service.lookup('Hello');

      expect(redisMock.getJson).toHaveBeenCalledWith('dict:hello');
    });

    it('returns null for an unknown word (404) and does not cache', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      mockFetch(404);

      const result = await service.lookup('xyzunknownword');

      expect(result).toBeNull();
      expect(redisMock.setJson).not.toHaveBeenCalled();
    });

    it('throws after exhausting retries on network error', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      global.fetch = jest.fn().mockRejectedValue(
        new Error('Network failure'),
      ) as unknown as typeof fetch;

      await expect(service.lookup('hello')).rejects.toThrow();
    }, 15_000);

    it('throws on non-404 HTTP error', async () => {
      redisMock.getJson.mockResolvedValueOnce(null);
      mockFetch(500);

      await expect(service.lookup('hello')).rejects.toThrow(/500|DictionaryAPI/);
    }, 15_000);
  });

  // ── ping ─────────────────────────────────────────────────────────────────

  describe('ping()', () => {
    it('returns status ok when API responds', async () => {
      mockFetch(200, API_RESPONSE);

      const result = await service.ping();

      expect(result.status).toBe('ok');
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('returns status error when API is down', async () => {
      global.fetch = jest.fn().mockRejectedValue(
        new Error('Connection refused'),
      ) as unknown as typeof fetch;

      const result = await service.ping();

      expect(result.status).toBe('error');
    }, 15_000);
  });
});
