import { describe, it, expect, vi } from 'vitest';
import { withRetry } from './retry.util';

describe('withRetry', () => {
  it('should return result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');

    const result = await withRetry(fn);

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed on second attempt', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');

    const result = await withRetry(fn, { baseDelayMs: 1 });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw after exhausting all attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));

    await expect(
      withRetry(fn, { attempts: 3, baseDelayMs: 1, label: 'test-op' }),
    ).rejects.toThrow('test-op failed after 3 attempts: always fails');

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should default to 3 attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    await expect(withRetry(fn, { baseDelayMs: 1 })).rejects.toThrow();

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('1'))
      .mockRejectedValueOnce(new Error('2'))
      .mockResolvedValue('ok');

    const start = Date.now();
    await withRetry(fn, { attempts: 3, baseDelayMs: 10 });
    const elapsed = Date.now() - start;

    // base=10: delay1=10ms, delay2=20ms, total ~30ms minimum
    expect(elapsed).toBeGreaterThanOrEqual(20);
  });

  it('should include the original error message in the thrown error', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('connection refused'));

    await expect(
      withRetry(fn, { attempts: 1, label: 'redis' }),
    ).rejects.toThrow('redis failed after 1 attempts: connection refused');
  });

  it('should handle non-Error rejections', async () => {
    const fn = vi.fn().mockRejectedValue('string-error');

    await expect(
      withRetry(fn, { attempts: 1, baseDelayMs: 1 }),
    ).rejects.toThrow('string-error');
  });

  it('should use "operation" as default label', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    await expect(
      withRetry(fn, { attempts: 1 }),
    ).rejects.toThrow('operation failed');
  });
});
