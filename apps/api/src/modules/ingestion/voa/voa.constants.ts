import { ContentSource } from '@prisma/client';

/**
 * Working VOA Learning English RSS feeds.
 * Format: https://learningenglish.voanews.com/api/?z={zoneId}&p={page}
 *
 * Zone IDs discovered from https://learningenglish.voanews.com :
 *   z=952   — Lessons of the Day
 *   z=6042  — How to Pronounce (beginner-friendly)
 *   z=3619  — English in a Minute (intermediate)
 *   z=1689  — VOA Learning English Podcast (all levels, with audio)
 *
 * All zones return the same "latest 20 articles" with pagination support.
 * We use 3 separate zones mapped to CEFR levels based on program difficulty,
 * and paginate to fetch up to 60 articles per zone.
 */
export const VOA_FEEDS: Record<
  'VOA_BEGINNING' | 'VOA_INTERMEDIATE' | 'VOA_ADVANCED',
  { zoneId: string; pages: number }
> = {
  VOA_BEGINNING:    { zoneId: '6042', pages: 3 }, // How to Pronounce — A1/A2
  VOA_INTERMEDIATE: { zoneId: '3619', pages: 3 }, // English in a Minute — B1/B2
  VOA_ADVANCED:     { zoneId: '952',  pages: 3 }, // Lessons of the Day — B2/C1
};

export const VOA_RSS_BASE = 'https://learningenglish.voanews.com/api/';

export function buildVoaFeedUrl(zoneId: string, page: number): string {
  return `${VOA_RSS_BASE}?z=${zoneId}&p=${page}`;
}

export const VOA_SOURCES = Object.keys(VOA_FEEDS) as Array<
  keyof typeof VOA_FEEDS
>;

export const VOA_MIN_WORDS = 100;
export const VOA_MAX_WORDS = 10_000;

export const SOURCE_TO_PRISMA: Record<keyof typeof VOA_FEEDS, ContentSource> = {
  VOA_BEGINNING:    ContentSource.VOA_BEGINNING,
  VOA_INTERMEDIATE: ContentSource.VOA_INTERMEDIATE,
  VOA_ADVANCED:     ContentSource.VOA_ADVANCED,
};
