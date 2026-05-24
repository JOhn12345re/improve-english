import type { FreeTierLimits } from '@englishflow/shared-types';

// Source de verite pour les limites du free tier
// Ne jamais hardcoder ces valeurs dans le code metier
export const FREE_TIER_LIMITS: FreeTierLimits = {
  daily_lessons: 3,
  native_languages: 1,
  ai_conversation: false,
  offline_mode: false,
  advanced_stats: false,
  certificate: false,
};

export const PREMIUM_LIMITS: FreeTierLimits = {
  daily_lessons: Infinity,
  native_languages: 7,
  ai_conversation: true,
  offline_mode: true,
  advanced_stats: true,
  certificate: true,
};

export const TRIAL_DAYS = 7;
