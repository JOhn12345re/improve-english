export type SupportedLanguage = 'en-US' | 'en-GB' | 'fr-FR' | 'es' | 'de-DE' | 'pt-PT' | 'it';

export interface LtReplacement {
  value: string;
}

export interface LtContext {
  text: string;
  offset: number;
  length: number;
}

export interface LtRule {
  id: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
}

export interface LtMatch {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: LtReplacement[];
  context: LtContext;
  rule: LtRule;
}

export interface CorrectionResult {
  text: string;
  language: SupportedLanguage;
  /** All grammar/spelling matches found */
  matches: LtMatch[];
  /** Number of issues detected */
  errorCount: number;
  /** True when no issues are found */
  isCorrect: boolean;
}
