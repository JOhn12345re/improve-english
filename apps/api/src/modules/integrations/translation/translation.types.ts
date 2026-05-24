export type TranslationProvider = 'mymemory' | 'deepl';

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  provider: TranslationProvider;
}

/** Supported language codes for MyMemory (IETF BCP-47) */
export type MyMemoryLang = 'en' | 'fr' | 'es' | 'it' | 'de' | 'pt' | 'ar';

/** Supported language codes for DeepL (ISO 639-1 uppercase) */
export type DeepLLang = 'EN' | 'FR' | 'ES' | 'IT' | 'DE' | 'PT' | 'AR';

// ── Raw API response shapes ────────────────────────────────────────────────

export interface MyMemoryResponse {
  responseStatus: number;
  responseData: {
    translatedText: string;
    match: number;
  };
  quotaFinished?: boolean;
}

export interface DeepLResponse {
  translations: Array<{
    detected_source_language: string;
    text: string;
  }>;
}
