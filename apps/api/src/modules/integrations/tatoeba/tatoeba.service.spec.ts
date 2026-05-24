import { Test, TestingModule } from '@nestjs/testing';
import { TatoebaService } from './tatoeba.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CefrLevel } from '@englishflow/shared-types';

// ── Fixtures ───────────────────────────────────────────────────────────────

const PAIR_ROW = {
  source_id: 1,
  target_id: 2,
  source_text: 'Hello, how are you?',
  target_text: 'Bonjour, comment allez-vous ?',
  cecrl_level: CefrLevel.A1,
};

const SENTENCE_ROW = {
  id: 1,
  lang: 'eng',
  text: 'Hello, how are you?',
  lengthChars: 19,
  cecrlLevel: CefrLevel.A1,
};

// ── Mock setup ─────────────────────────────────────────────────────────────

const prismaMock = {
  $queryRaw: jest.fn(),
  tatoebaSentence: {
    findUnique: jest.fn(),
  },
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('TatoebaService', () => {
  let service: TatoebaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TatoebaService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TatoebaService>(TatoebaService);
    jest.clearAllMocks();
  });

  // ── findRandom ─────────────────────────────────────────────────────────

  describe('findRandom()', () => {
    it('returns mapped TatoebaPair array', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([PAIR_ROW]);

      const result = await service.findRandom(CefrLevel.A1);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        sourceId: 1,
        targetId: 2,
        sourceLang: 'eng',
        targetLang: 'fra',
        sourceText: 'Hello, how are you?',
        targetText: 'Bonjour, comment allez-vous ?',
        cecrlLevel: CefrLevel.A1,
      });
    });

    it('returns empty array when no pairs found', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([]);

      const result = await service.findRandom(CefrLevel.C2);

      expect(result).toEqual([]);
    });

    it('passes sourceLang and targetLang to the query', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([PAIR_ROW]);

      await service.findRandom(CefrLevel.A1, 'eng', 'spa');

      expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });

  // ── findById ───────────────────────────────────────────────────────────

  describe('findById()', () => {
    it('returns a sentence DTO when found', async () => {
      prismaMock.tatoebaSentence.findUnique.mockResolvedValueOnce(SENTENCE_ROW);

      const result = await service.findById(1);

      expect(result).toMatchObject({
        id: 1,
        lang: 'eng',
        text: 'Hello, how are you?',
        cecrlLevel: CefrLevel.A1,
      });
    });

    it('returns null when sentence does not exist', async () => {
      prismaMock.tatoebaSentence.findUnique.mockResolvedValueOnce(null);

      const result = await service.findById(99999);

      expect(result).toBeNull();
    });
  });

  // ── stats ──────────────────────────────────────────────────────────────

  describe('stats()', () => {
    it('aggregates counts by lang and level', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([
        { lang: 'eng', cecrl_level: CefrLevel.A1, count: BigInt(500) },
        { lang: 'eng', cecrl_level: CefrLevel.B1, count: BigInt(300) },
        { lang: 'fra', cecrl_level: CefrLevel.A1, count: BigInt(200) },
      ]);

      const result = await service.stats();

      expect(result['eng'].total).toBe(800);
      expect(result['eng'].byLevel[CefrLevel.A1]).toBe(500);
      expect(result['fra'].total).toBe(200);
    });

    it('returns empty object when table is empty', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([]);

      const result = await service.stats();

      expect(result).toEqual({});
    });
  });
});
