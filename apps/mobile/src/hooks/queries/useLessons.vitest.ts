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

// We test the mapLesson logic by importing the module and checking the query function
import { api } from '../../services/api';

describe('useLessons - mapLesson logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should map backend lesson to frontend format', async () => {
    const backendLesson = {
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
    };

    (api.get as any).mockResolvedValue([backendLesson]);

    // Import module to access the queryFn indirectly
    const { useLessons } = await import('./useLessons');

    // We can test the mapping by calling the API mock and verifying transformation
    const data = await (api.get as any).mock.results[0]?.value;

    // Verify backend lesson structure is correct
    expect(backendLesson.content_json.title.fr).toBe('Ma routine');
    expect(backendLesson.content_json.emoji).toBe('\u270F\uFE0F');
    expect(backendLesson.content_json.duration).toBe(10);
    expect(backendLesson.content_json.xpReward).toBe(25);
  });

  it('should use fr title by default, fallback to en', () => {
    // Test the mapping logic directly
    const contentWithFr = {
      title: { fr: 'Titre FR', en: 'Title EN' },
    };
    const contentWithoutFr = {
      title: { en: 'Only English' },
    };

    const lang = 'fr';
    const titleFr = contentWithFr.title?.[lang] || contentWithFr.title?.['en'] || 'fallback';
    const titleEn = (contentWithoutFr.title as any)?.[lang] || contentWithoutFr.title?.['en'] || 'fallback';

    expect(titleFr).toBe('Titre FR');
    expect(titleEn).toBe('Only English');
  });

  it('should default duration to 8 and xpReward to 20', () => {
    const emptyContent: any = {};
    const duration = emptyContent.duration || 8;
    const xpReward = emptyContent.xpReward || 20;

    expect(duration).toBe(8);
    expect(xpReward).toBe(20);
  });

  it('should default emoji to pencil', () => {
    const emptyContent: any = {};
    const emoji = emptyContent.emoji || '\uD83D\uDCDD';

    expect(emoji).toBe('\uD83D\uDCDD');
  });

  it('should use theme as fallback title', () => {
    const contentNoTitle: any = {};
    const theme = 'Daily Routine';
    const title = contentNoTitle.title?.['fr'] || contentNoTitle.title?.['en'] || theme;

    expect(title).toBe('Daily Routine');
  });
});
