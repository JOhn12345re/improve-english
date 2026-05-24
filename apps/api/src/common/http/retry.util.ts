/**
 * Retries an async operation with exponential backoff.
 *
 * @param fn        - The async operation to attempt.
 * @param attempts  - Maximum number of attempts (default 3).
 * @param baseDelayMs - Initial delay in ms, doubles each retry (default 500).
 * @param label     - Label used in thrown error messages.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    attempts?: number;
    baseDelayMs?: number;
    label?: string;
  } = {},
): Promise<T> {
  const { attempts = 3, baseDelayMs = 500, label = 'operation' } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < attempts - 1) {
        await sleep(baseDelayMs * Math.pow(2, attempt));
      }
    }
  }

  const message =
    lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`${label} failed after ${attempts} attempts: ${message}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
