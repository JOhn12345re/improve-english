import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import i18n from '../../services/i18n';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: string;
  orderIndex: number;
  emoji: string;
  duration: number;
  xpReward: number;
  exercises?: any[];
}

interface BackendLesson {
  id: string;
  level: string;
  theme: string;
  order: number;
  content_json: {
    title?: Record<string, string>;
    description?: Record<string, string>;
    emoji?: string;
    duration?: number;
    xpReward?: number;
    exercises?: any[];
  };
}

function mapLesson(backendLesson: BackendLesson): Lesson {
  const lang = i18n?.language || 'fr';
  const c = backendLesson.content_json || {};
  return {
    id: backendLesson.id,
    level: backendLesson.level,
    orderIndex: backendLesson.order,
    title: c.title?.[lang] || c.title?.['en'] || backendLesson.theme,
    description: c.description?.[lang] || c.description?.['en'] || '',
    emoji: c.emoji || '\uD83D\uDCDD',
    duration: c.duration || 8,
    xpReward: c.xpReward || 20,
    exercises: c.exercises || [],
  };
}

export function useLessons() {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const data = await api.get<BackendLesson[]>('/lessons');
      return data.map(mapLesson);
    },
  });
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: ['lessons', id],
    queryFn: async () => {
      const data = await api.get<BackendLesson>(`/lessons/${id}`);
      return mapLesson(data);
    },
    enabled: !!id,
  });
}
