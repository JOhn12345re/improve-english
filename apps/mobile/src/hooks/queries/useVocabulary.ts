import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  level: string;
  partOfSpeech: string;
  masteryLevel?: number;
  reps?: number;
}

export interface VocabularyStats {
  total: number;
  due: number;
  mastered: number;
  masteryPercent: number;
}

export function useDueVocabulary() {
  return useQuery({
    queryKey: ['vocabulary', 'due'],
    queryFn: () => api.get<VocabularyItem[]>('/vocabulary/due'),
  });
}

export function useVocabularyStats() {
  return useQuery({
    queryKey: ['vocabulary', 'stats'],
    queryFn: () => api.get<VocabularyStats>('/vocabulary/stats'),
  });
}

export function useReviewVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { vocabularyId: string; quality: number }) =>
      api.post('/vocabulary/review', {
        word_id: data.vocabularyId,
        rating: data.quality,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary', 'due'] });
      queryClient.invalidateQueries({ queryKey: ['vocabulary', 'stats'] });
    },
  });
}

export function useAddVocabularyWords() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (words: Array<{ word: string; translation: string; level: string }>) =>
      api.post('/vocabulary/add-words', { words }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary', 'due'] });
      queryClient.invalidateQueries({ queryKey: ['vocabulary', 'stats'] });
    },
  });
}
