// Configuration du rate limiting
// Modifie ici pour ajuster les limites par route ou globalement
export const THROTTLER_CONFIG = {
  default: { ttl: 60_000, limit: 100 },   // 100 req/min
  auth: { ttl: 60_000, limit: 10 },        // 10 tentatives de login/min
  assessment: { ttl: 60_000, limit: 5 },   // 5 evaluations/min
};
