// Masque automatiquement les PII dans les logs (RGPD)
const PII_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // email
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,      // carte bancaire
];

function sanitize(message: string): string {
  let sanitized = message;
  for (const pattern of PII_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  return sanitized;
}

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message: string, context?: object) => {
    if (isDev) {
      console.info(`[INFO] ${sanitize(message)}`, context ?? '');
    }
  },
  warn: (message: string, context?: object) => {
    if (isDev) {
      console.warn(`[WARN] ${sanitize(message)}`, context ?? '');
    }
  },
  error: (message: string, error?: unknown) => {
    const msg = sanitize(message);
    if (isDev) {
      console.error(`[ERROR] ${msg}`, error ?? '');
    }
    // En production : envoyer vers un service de monitoring (ex: Sentry)
    // Sentry.captureException(error, { extra: { message: msg } });
  },
  debug: (message: string, context?: object) => {
    if (isDev) {
      console.debug(`[DEBUG] ${sanitize(message)}`, context ?? '');
    }
  },
};
