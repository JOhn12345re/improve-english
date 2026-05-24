import { CefrLevel } from '@englishflow/shared-types';

export interface TatoebaSentenceDto {
  id: number;
  lang: string;
  text: string;
  lengthChars: number;
  cecrlLevel: CefrLevel | null;
}

/** A bilingual sentence pair (e.g. EN ↔ FR) ready to use in exercises */
export interface TatoebaPair {
  sourceId: number;
  targetId: number;
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  targetText: string;
  cecrlLevel: CefrLevel | null;
}
