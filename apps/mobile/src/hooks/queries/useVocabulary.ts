import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  level: string;
  partOfSpeech: string;
}

export function useDueVocabulary() {
  return useQuery({
    queryKey: ['vocabulary', 'due'],
    queryFn: () => api.get<VocabularyItem[]>('/vocabulary/due'),
  });
}

export function useReviewVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { vocabularyId: string; quality: number }) => 
      api.post('/vocabulary/review', data),
    onSuccess: () => {
      // Invalidate due vocabulary after a review to fetch the updated list
      queryClient.invalidateQueries({ queryKey: ['vocabulary', 'due'] });
    },
  });
}
