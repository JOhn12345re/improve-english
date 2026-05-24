import { CefrLevel } from '@englishflow/shared-types';

/** Raw word object returned by the Datamuse API */
export interface DatamuseWord {
  word: string;
  score: number;
  /** Tags such as "n" (noun), "v" (verb), "f:12.34" (frequency per million) */
  tags?: string[];
  /** Definitions when md=d is requested */
  defs?: string[];
}

/** DatamuseWord enriched with parsed frequency and mapped CEFR level */
export interface RatedWord extends DatamuseWord {
  frequencyPerMillion: number;
  cefrLevel: CefrLevel;
}
