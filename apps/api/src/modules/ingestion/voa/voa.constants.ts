import { ContentSource } from '@prisma/client';

/**
 * VOA Learning English RSS feeds — podcast format.
 * Format: https://learningenglish.voanews.com/podcast/?zoneId={id}&format=RSS
 *
 * Only zone 1689 (Learning English Podcast) reliably returns items with
 * audio MP3 enclosures. The podcast RSS provides short descriptions (~20 words)
 * plus a real MP3 audio URL per episode.
 *
 * For full-text content we rely on Gutenberg / Archive.org ingestion instead.
 */
export const VOA_FEEDS: Record<
  'VOA_BEGINNING' | 'VOA_INTERMEDIATE' | 'VOA_ADVANCED',
  { zoneId: string; pages: number }
> = {
  VOA_BEGINNING:    { zoneId: '1689', pages: 1 }, // Learning English Podcast — all levels
  VOA_INTERMEDIATE: { zoneId: '1689', pages: 1 }, // same feed, deduplicated via source_url
  VOA_ADVANCED:     { zoneId: '1689', pages: 1 }, // same feed, deduplicated via source_url
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
