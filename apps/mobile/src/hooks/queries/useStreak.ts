import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export interface StreakInfo {
  current: number;
  longest: number;
  isActiveToday: boolean;
  nextMilestone: number | null;
  xp: number;
}

export function useStreak() {
  return useQuery<StreakInfo>({
    queryKey: ['streak'],
    queryFn: () => api.get<StreakInfo>('/progress/streak'),
    staleTime: 60_000,
  });
}
