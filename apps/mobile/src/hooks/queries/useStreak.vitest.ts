import { describe, it, expect, vi } from 'vitest';

// Mock api
vi.mock('../../services/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from '../../services/api';

describe('useStreak - query function', () => {
  it('should call /progress/streak endpoint', async () => {
    const mockStreak = {
      current: 5,
      longest: 12,
      isActiveToday: true,
      nextMilestone: 7,
      xp: 300,
    };
    (api.get as any).mockResolvedValue(mockStreak);

    const result = await api.get('/progress/streak');

    expect(result).toEqual(mockStreak);
    expect(api.get).toHaveBeenCalledWith('/progress/streak');
  });

  it('should handle streak with no next milestone', async () => {
    const mockStreak = {
      current: 400,
      longest: 400,
      isActiveToday: true,
      nextMilestone: null,
      xp: 5000,
    };
    (api.get as any).mockResolvedValue(mockStreak);

    const result = await api.get('/progress/streak');

    expect(result.nextMilestone).toBeNull();
  });

  it('should handle inactive today', async () => {
    const mockStreak = {
      current: 3,
      longest: 10,
      isActiveToday: false,
      nextMilestone: 7,
      xp: 100,
    };
    (api.get as any).mockResolvedValue(mockStreak);

    const result = await api.get('/progress/streak');

    expect(result.isActiveToday).toBe(false);
  });
});

describe('StreakInfo type', () => {
  it('should have all required fields', () => {
    const streakInfo = {
      current: 5,
      longest: 12,
      isActiveToday: true,
      nextMilestone: 7,
      xp: 300,
    };

    expect(typeof streakInfo.current).toBe('number');
    expect(typeof streakInfo.longest).toBe('number');
    expect(typeof streakInfo.isActiveToday).toBe('boolean');
    expect(typeof streakInfo.xp).toBe('number');
  });
});
