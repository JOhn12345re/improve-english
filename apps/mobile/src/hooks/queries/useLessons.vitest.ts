import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock i18n
vi.mock('../../services/i18n', () => ({
  default: { language: 'fr' },
}));

// Mock api
vi.mock('../../services/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

// Mock react-query to capture and return the queryFn
let capturedQueryFns: Record<string, any> = {};
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn((config: any) => {
    const key = JSON.stringify(config.queryKey);
    capturedQueryFns[key] = config.queryFn;
    return { data: undefined, isLoading: true };
  }),
}));

import { api } from '../../services/api';

describe('useLessons - mapLesson via queryFn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedQueryFns = {};
  });

  it('should map backend lesson with fr title', async () => {
    const backendLessons = [
      {
        id: 'l1',
        level: 'A1',
        theme: 'Daily Routine',
        order: 1,
        content_json: {
          title: { fr: 'Ma routine', en: 'My routine' },
          description: { fr: 'Vocabulaire quotidien', en: 'Daily vocabulary' },
          emoji: '\u270F\uFE0F',
          duration: 10,
          xpReward: 25,
          exercises: [{ type: 'mcq' }],
        },
      },
    ];

    (api.get as any).mockResolvedValue(backendLessons);

    // Import and trigger useLessons to capture queryFn
    const { useLessons } = await import('./useLessons');
    useLessons();

    const queryFn = capturedQueryFns['["lessons"]'];
    expect(queryFn).toBeDefined();

    const result = await queryFn();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('l1');
    expect(result[0].title).toBe('Ma routine');
    expect(result[0].description).toBe('Vocabulaire quotidien');
    expect(result[0].emoji).toBe('\u270F\uFE0F');
    expect(result[0].duration).toBe(10);
    expect(result[0].xpReward).toBe(25);
    expect(result[0].level).toBe('A1');
    expect(result[0].orderIndex).toBe(1);
    expect(result[0].exercises).toHaveLength(1);
  });

  it('should fallback to en title when fr is missing', async () => {
    const backendLessons = [
      {
        id: 'l2',
        level: 'B1',
        theme: 'Theme Fallback',
        order: 2,
        content_json: {
          title: { en: 'English Only Title' },
          description: { en: 'English desc' },
        },
      },
    ];

    (api.get as any).mockResolvedValue(backendLessons);

    const { useLessons } = await import('./useLessons');
    useLessons();

    const queryFn = capturedQueryFns['["lessons"]'];
    const result = await queryFn();

    expect(result[0].title).toBe('English Only Title');
    expect(result[0].description).toBe('English desc');
  });

  it('should fallback to theme when no title at all', async () => {
    const backendLessons = [
      {
        id: 'l3',
        level: 'A2',
        theme: 'Fallback Theme',
        order: 3,
        content_json: {},
      },
    ];

    (api.get as any).mockResolvedValue(backendLessons);

    const { useLessons } = await import('./useLessons');
    useLessons();

    const queryFn = capturedQueryFns['["lessons"]'];
    const result = await queryFn();

    expect(result[0].title).toBe('Fallback Theme');
    expect(result[0].description).toBe('');
    expect(result[0].duration).toBe(8);
    expect(result[0].xpReward).toBe(20);
    expect(result[0].emoji).toBe('\uD83D\uDCDD');
    expect(result[0].exercises).toEqual([]);
  });

  it('should handle useLesson for a single lesson', async () => {
    const backendLesson = {
      id: 'l4',
      level: 'A1',
      theme: 'Single',
      order: 1,
      content_json: {
        title: { fr: 'Lecon unique' },
        duration: 5,
        xpReward: 15,
      },
    };

    (api.get as any).mockResolvedValue(backendLesson);

    const { useLesson } = await import('./useLessons');
    useLesson('l4');

    const queryFn = capturedQueryFns['["lessons","l4"]'];
    expect(queryFn).toBeDefined();

    const result = await queryFn();

    expect(result.id).toBe('l4');
    expect(result.title).toBe('Lecon unique');
    expect(result.duration).toBe(5);
    expect(result.xpReward).toBe(15);
  });
});
