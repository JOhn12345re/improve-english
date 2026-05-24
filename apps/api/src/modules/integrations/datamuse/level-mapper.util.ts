import { CefrLevel } from '@englishflow/shared-types';

/**
 * Maps a Datamuse word frequency (occurrences per million words) to a CEFR level.
 *
 * Thresholds derived from corpus-based CEFR frequency research:
 *   f > 50  → A1  (very high frequency, core vocabulary)
 *   f > 20  → A2
 *   f > 8   → B1
 *   f > 3   → B2
 *   f > 1   → C1
 *   f <= 1  → C2  (rare / academic vocabulary)
 */
export function frequencyToCefrLevel(frequencyPerMillion: number): CefrLevel {
  if (frequencyPerMillion > 50) return CefrLevel.A1;
  if (frequencyPerMillion > 20) return CefrLevel.A2;
  if (frequencyPerMillion > 8)  return CefrLevel.B1;
  if (frequencyPerMillion > 3)  return CefrLevel.B2;
  if (frequencyPerMillion > 1)  return CefrLevel.C1;
  return CefrLevel.C2;
}

/**
 * Parses the Datamuse frequency tag string (e.g. "f:12.34") into a number.
 * Returns 0 if the tag is absent or malformed.
 */
export function parseFrequencyTag(tags: string[] | undefined): number {
  const tag = tags?.find((t) => t.startsWith('f:'));
  if (!tag) return 0;
  const value = parseFloat(tag.slice(2));
  return isNaN(value) ? 0 : value;
}
