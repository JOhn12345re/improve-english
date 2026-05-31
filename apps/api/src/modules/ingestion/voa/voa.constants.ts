import { ContentSource } from '@prisma/client';

/**
 * VOA Learning English RSS feeds — podcast format.
 * Format: https://learningenglish.voanews.com/podcast/?zoneId={id}&format=RSS
 *
 * Zone IDs (verified May 2026):
 *  - 1579: Beginning Level (Let's Learn English, daily news)
 *  - 1581: Intermediate Level (grammar, everyday English)
 *  - 3521: News Words (advanced vocabulary in context)
 *  - 1689: Learning English Podcast (mixed levels, audio-focused)
 */
export const VOA_FEEDS: Record<
  'VOA_BEGINNING' | 'VOA_INTERMEDIATE' | 'VOA_ADVANCED',
  { zoneId: string; pages: number }
> = {
  VOA_BEGINNING:    { zoneId: '1579', pages: 1 }, // Beginning Level
  VOA_INTERMEDIATE: { zoneId: '1581', pages: 1 }, // Intermediate Level
  VOA_ADVANCED:     { zoneId: '3521', pages: 1 }, // News Words (advanced vocabulary)
};

export const VOA_RSS_BASE = 'https://learningenglish.voanews.com/podcast/';

export function buildVoaFeedUrl(zoneId: string, _page: number): string {
  return `${VOA_RSS_BASE}?zoneId=${zoneId}&format=RSS`;
}

export const VOA_SOURCES = Object.keys(VOA_FEEDS) as Array<
  keyof typeof VOA_FEEDS
>;

export const VOA_MIN_WORDS = 5;
export const VOA_MAX_WORDS = 10_000;

export const SOURCE_TO_PRISMA: Record<keyof typeof VOA_FEEDS, ContentSource> = {
  VOA_BEGINNING:    ContentSource.VOA_BEGINNING,
  VOA_INTERMEDIATE: ContentSource.VOA_INTERMEDIATE,
  VOA_ADVANCED:     ContentSource.VOA_ADVANCED,
};
