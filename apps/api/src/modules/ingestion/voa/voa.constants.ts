import { ContentSource } from '@prisma/client';

export const VOA_FEEDS: Record<
  'VOA_BEGINNING' | 'VOA_INTERMEDIATE' | 'VOA_ADVANCED',
  string
> = {
  VOA_BEGINNING:    'https://learningenglish.voanews.com/api/zmgqoe$voe',
  VOA_INTERMEDIATE: 'https://learningenglish.voanews.com/api/zogqie$Ymp',
  VOA_ADVANCED:     'https://learningenglish.voanews.com/api/z_gqoe_v_p',
};

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
