import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VocabularyService } from './vocabulary.service';
import { FsrsService } from './fsrs.service';
import { PrismaService } from '../../common/prisma/prisma.service';

const prismaMock = {
  vocabularyWord: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  userVocabulary: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
};

const fsrsMock = {
  schedule: vi.fn(),
};

describe('VocabularyService', () => {
  let service: VocabularyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VocabularyService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: FsrsService, useValue: fsrsMock },
      ],
    }).compile();

    service = module.get(VocabularyService);
    vi.clearAllMocks();
  });

  // ── getWordsByPack ──────────────────────────────────────────────────────

  describe('getWordsByPack', () => {
    it('should return all words when no pack specified', async () => {
      const words = [{ word_en: 'hello' }, { word_en: 'world' }];
      prismaMock.vocabularyWord.findMany.mockResolvedValue(words);

      const result = await service.getWordsByPack();

      expect(result).toEqual(words);
      expect(prismaMock.vocabularyWord.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ level: 'asc' }, { importance: 'desc' }],
      });
    });

    it('should filter by pack when specified', async () => {
      prismaMock.vocabularyWord.findMany.mockResolvedValue([]);

      await service.getWordsByPack('essential-500');

      expect(prismaMock.vocabularyWord.findMany).toHaveBeenCalledWith({
        where: { pack: 'essential-500' },
        orderBy: [{ level: 'asc' }, { importance: 'desc' }],
      });
    });
  });

  // ── getDueWords ─────────────────────────────────────────────────────────

  describe('getDueWords', () => {
    it('should return due words in mobile-friendly format', async () => {
      const records = [
        {
          word_id: 'w1',
          mastery_level: 0.3,
          reps: 2,
          word: {
            word_en: 'hello',
            translations_json: { fr: 'bonjour' },
            level: 'A1',
          },
        },
      ];
      prismaMock.userVocabulary.findMany.mockResolvedValue(records);

      const result = await service.getDueWords('user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'w1',
        word: 'hello',
        translation: 'bonjour',
        level: 'A1',
        partOfSpeech: '',
        masteryLevel: 0.3,
        reps: 2,
      });
    });

    it('should take max 20 due words', async () => {
      prismaMock.userVocabulary.findMany.mockResolvedValue([]);

      await service.getDueWords('user-1');

      expect(prismaMock.userVocabulary.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 }),
      );
    });

    it('should use fr translation by default, fallback to en', async () => {
      const records = [
        {
          word_id: 'w1',
          mastery_level: 0,
          reps: 0,
          word: {
            word_en: 'test',
            translations_json: { en: 'test-en' },
            level: 'A1',
          },
        },
      ];
      prismaMock.userVocabulary.findMany.mockResolvedValue(records);

      const result = await service.getDueWords('user-1');

      expect(result[0].translation).toBe('test-en');
    });
  });

  // ── getStats ────────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('should return vocabulary statistics', async () => {
      prismaMock.userVocabulary.count.mockResolvedValueOnce(100); // total
      prismaMock.userVocabulary.count.mockResolvedValueOnce(5);   // due
      prismaMock.userVocabulary.count.mockResolvedValueOnce(40);  // mastered
      prismaMock.userVocabulary.aggregate.mockResolvedValue({
        _avg: { mastery_level: 0.65 },
      });

      const stats = await service.getStats('user-1');

      expect(stats).toEqual({
        total: 100,
        due: 5,
        mastered: 40,
        masteryPercent: 65,
      });
    });

    it('should handle zero vocabulary gracefully', async () => {
      prismaMock.userVocabulary.count.mockResolvedValue(0);
      prismaMock.userVocabulary.aggregate.mockResolvedValue({
        _avg: { mastery_level: null },
      });

      const stats = await service.getStats('user-1');

      expect(stats.total).toBe(0);
      expect(stats.masteryPercent).toBe(0);
    });
  });

  // ── reviewWord ──────────────────────────────────────────────────────────

  describe('reviewWord', () => {
    it('should schedule review using FSRS and upsert', async () => {
      const nextReview = new Date('2025-01-10');
      prismaMock.userVocabulary.findUnique.mockResolvedValue({
        stability: 2,
        difficulty: 4,
        reps: 3,
        lapses: 0,
      });
      fsrsMock.schedule.mockReturnValue({
        next_review_at: nextReview,
        stability: 3,
        difficulty: 3.5,
        reps: 4,
        lapses: 0,
        mastery_level: 0.4,
      });
      prismaMock.userVocabulary.upsert.mockResolvedValue({
        next_review_at: nextReview,
        mastery_level: 0.4,
      });

      const result = await service.reviewWord('user-1', {
        word_id: 'w1',
        rating: 3,
      } as any);

      expect(result.success).toBe(true);
      expect(result.nextReview).toEqual(nextReview);
      expect(result.mastery).toBe(0.4);
      expect(fsrsMock.schedule).toHaveBeenCalledWith(
        { stability: 2, difficulty: 4, reps: 3, lapses: 0 },
        3,
      );
    });

    it('should accept mobile field names (vocabularyId, quality)', async () => {
      prismaMock.userVocabulary.findUnique.mockResolvedValue(null);
      fsrsMock.schedule.mockReturnValue({
        next_review_at: new Date(),
        stability: 1,
        difficulty: 5,
        reps: 1,
        lapses: 0,
        mastery_level: 0.1,
      });
      prismaMock.userVocabulary.upsert.mockResolvedValue({
        next_review_at: new Date(),
        mastery_level: 0.1,
      });

      await service.reviewWord('user-1', {
        word_id: '',
        vocabularyId: 'mobile-w1',
        quality: 4,
      } as any);

      expect(fsrsMock.schedule).toHaveBeenCalledWith(
        expect.objectContaining({ stability: 1, difficulty: 5, reps: 0, lapses: 0 }),
        4,
      );
    });

    it('should create a new card for first review', async () => {
      prismaMock.userVocabulary.findUnique.mockResolvedValue(null);
      fsrsMock.schedule.mockReturnValue({
        next_review_at: new Date(),
        stability: 1,
        difficulty: 5,
        reps: 1,
        lapses: 0,
        mastery_level: 0.1,
      });
      prismaMock.userVocabulary.upsert.mockResolvedValue({
        next_review_at: new Date(),
        mastery_level: 0.1,
      });

      await service.reviewWord('user-1', { word_id: 'w1', rating: 3 } as any);

      expect(fsrsMock.schedule).toHaveBeenCalledWith(
        { stability: 1, difficulty: 5, reps: 0, lapses: 0 },
        3,
      );
    });
  });

  // ── addWordsFromLesson ──────────────────────────────────────────────────

  describe('addWordsFromLesson', () => {
    it('should add new words and skip existing ones', async () => {
      const words = [
        { word: 'Hello', translation: 'Bonjour', level: 'A1' },
        { word: 'World', translation: 'Monde', level: 'A1' },
      ];

      // hello exists in vocab, world doesn't
      prismaMock.vocabularyWord.findUnique
        .mockResolvedValueOnce({ id: 'vw1', word_en: 'hello' })
        .mockResolvedValueOnce(null);

      prismaMock.vocabularyWord.create.mockResolvedValue({ id: 'vw2', word_en: 'world' });

      // hello already in user vocabulary, world is new
      prismaMock.userVocabulary.findUnique
        .mockResolvedValueOnce({ word_id: 'vw1' })
        .mockResolvedValueOnce(null);

      prismaMock.userVocabulary.create.mockResolvedValue({});

      const result = await service.addWordsFromLesson('user-1', words);

      expect(result.added).toBe(1); // only "world" added
    });

    it('should lowercase and trim words', async () => {
      prismaMock.vocabularyWord.findUnique.mockResolvedValue(null);
      prismaMock.vocabularyWord.create.mockResolvedValue({ id: 'vw1' });
      prismaMock.userVocabulary.findUnique.mockResolvedValue(null);
      prismaMock.userVocabulary.create.mockResolvedValue({});

      await service.addWordsFromLesson('user-1', [
        { word: '  Hello  ', translation: 'Bonjour', level: 'A1' },
      ]);

      expect(prismaMock.vocabularyWord.findUnique).toHaveBeenCalledWith({
        where: { word_en: 'hello' },
      });
    });
  });
});
