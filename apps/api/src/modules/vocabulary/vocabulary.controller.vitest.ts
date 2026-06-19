import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';

describe('VocabularyController', () => {
  let controller: VocabularyController;
  let service: VocabularyService;

  const mockReq = { user: { id: 'u1' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VocabularyController],
      providers: [
        {
          provide: VocabularyService,
          useValue: {
            getWordsByPack: vi.fn(),
            getDueWords: vi.fn(),
            getStats: vi.fn(),
            reviewWord: vi.fn(),
            addWordsFromLesson: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(VocabularyController);
    service = module.get(VocabularyService);
  });

  describe('GET /vocabulary', () => {
    it('should return all words without pack filter', async () => {
      const words = [{ word_en: 'hello' }];
      vi.spyOn(service, 'getWordsByPack').mockResolvedValue(words as any);

      const result = await controller.getAll();

      expect(result).toEqual(words);
      expect(service.getWordsByPack).toHaveBeenCalledWith(undefined);
    });

    it('should filter by pack', async () => {
      vi.spyOn(service, 'getWordsByPack').mockResolvedValue([]);

      await controller.getAll('essential-500');

      expect(service.getWordsByPack).toHaveBeenCalledWith('essential-500');
    });
  });

  describe('GET /vocabulary/due', () => {
    it('should return due words for user', async () => {
      const words = [{ id: 'w1', word: 'hello' }];
      vi.spyOn(service, 'getDueWords').mockResolvedValue(words as any);

      const result = await controller.getDue(mockReq);

      expect(result).toEqual(words);
    });
  });

  describe('GET /vocabulary/stats', () => {
    it('should return vocabulary stats', async () => {
      const stats = { total: 100, due: 5, mastered: 40, masteryPercent: 65 };
      vi.spyOn(service, 'getStats').mockResolvedValue(stats);

      const result = await controller.getStats(mockReq);

      expect(result).toEqual(stats);
    });
  });

  describe('POST /vocabulary/review', () => {
    it('should review a word', async () => {
      const dto = { word_id: 'w1', rating: 3 };
      const response = { success: true, nextReview: new Date(), mastery: 0.5 };
      vi.spyOn(service, 'reviewWord').mockResolvedValue(response);

      const result = await controller.review(mockReq, dto as any);

      expect(result).toEqual(response);
      expect(service.reviewWord).toHaveBeenCalledWith('u1', dto);
    });
  });

  describe('POST /vocabulary/add-words', () => {
    it('should add words from a lesson', async () => {
      const words = [{ word: 'hello', translation: 'bonjour', level: 'A1' }];
      vi.spyOn(service, 'addWordsFromLesson').mockResolvedValue({ added: 1 });

      const result = await controller.addWords(mockReq, { words });

      expect(result).toEqual({ added: 1 });
      expect(service.addWordsFromLesson).toHaveBeenCalledWith('u1', words);
    });
  });
});
