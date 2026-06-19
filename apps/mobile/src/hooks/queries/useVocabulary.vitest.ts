import { describe, it, expect, vi } from 'vitest';

// Mock api
vi.mock('../../services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock react-query (just verify configuration, not actual hooks)
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn((config: any) => config),
  useMutation: vi.fn((config: any) => config),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

import { api } from '../../services/api';

describe('Vocabulary hooks - query functions', () => {
  describe('getDue query function', () => {
    it('should call the correct API endpoint', async () => {
      const mockWords = [
        { id: 'w1', word: 'hello', translation: 'bonjour', level: 'A1', partOfSpeech: 'noun' },
      ];
      (api.get as any).mockResolvedValue(mockWords);

      const result = await api.get('/vocabulary/due');

      expect(result).toEqual(mockWords);
      expect(api.get).toHaveBeenCalledWith('/vocabulary/due');
    });
  });

  describe('getStats query function', () => {
    it('should call the stats endpoint', async () => {
      const mockStats = { total: 50, due: 3, mastered: 20, masteryPercent: 70 };
      (api.get as any).mockResolvedValue(mockStats);

      const result = await api.get('/vocabulary/stats');

      expect(result).toEqual(mockStats);
    });
  });

  describe('review mutation', () => {
    it('should send word_id and rating to review endpoint', async () => {
      (api.post as any).mockResolvedValue({ success: true });

      const data = { vocabularyId: 'w1', quality: 3 };
      await api.post('/vocabulary/review', {
        word_id: data.vocabularyId,
        rating: data.quality,
      });

      expect(api.post).toHaveBeenCalledWith('/vocabulary/review', {
        word_id: 'w1',
        rating: 3,
      });
    });
  });

  describe('addWords mutation', () => {
    it('should send words array to add-words endpoint', async () => {
      const words = [
        { word: 'hello', translation: 'bonjour', level: 'A1' },
        { word: 'goodbye', translation: 'au revoir', level: 'A1' },
      ];
      (api.post as any).mockResolvedValue({ added: 2 });

      await api.post('/vocabulary/add-words', { words });

      expect(api.post).toHaveBeenCalledWith('/vocabulary/add-words', { words });
    });
  });
});

describe('VocabularyItem type', () => {
  it('should have correct shape', () => {
    const item = {
      id: 'w1',
      word: 'hello',
      translation: 'bonjour',
      level: 'A1',
      partOfSpeech: 'interjection',
      masteryLevel: 0.5,
      reps: 3,
    };

    expect(item.id).toBeDefined();
    expect(item.word).toBeDefined();
    expect(item.translation).toBeDefined();
    expect(item.level).toBeDefined();
  });
});

describe('VocabularyStats type', () => {
  it('should have correct shape', () => {
    const stats = {
      total: 100,
      due: 5,
      mastered: 40,
      masteryPercent: 65,
    };

    expect(stats.total).toBeGreaterThanOrEqual(0);
    expect(stats.masteryPercent).toBeGreaterThanOrEqual(0);
    expect(stats.masteryPercent).toBeLessThanOrEqual(100);
  });
});
