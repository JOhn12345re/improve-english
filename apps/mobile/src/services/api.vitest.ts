import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock supabase before importing api
vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      }),
    },
  },
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Now import
import { api } from './api';

describe('api service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockResponse(status: number, body: any, contentType = 'application/json') {
    mockFetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: {
        get: (name: string) => (name === 'content-type' ? contentType : null),
      },
      json: async () => body,
    });
  }

  describe('get', () => {
    it('should make a GET request with auth headers', async () => {
      mockResponse(200, { data: 'test' });

      const result = await api.get('/test');

      expect(result).toEqual({ data: 'test' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should throw ApiError on non-ok response', async () => {
      mockResponse(401, { message: 'Unauthorized' });

      await expect(api.get('/protected')).rejects.toThrow('Unauthorized');
    });

    it('should throw with statusText when no message in body', async () => {
      mockResponse(500, null, 'text/plain');

      await expect(api.get('/fail')).rejects.toThrow();
    });
  });

  describe('post', () => {
    it('should make a POST request with JSON body', async () => {
      mockResponse(200, { success: true });

      const result = await api.post('/submit', { score: 85 });

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/submit'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ score: 85 }),
        }),
      );
    });

    it('should handle POST without body', async () => {
      mockResponse(200, { ok: true });

      const result = await api.post('/action');

      expect(result).toEqual({ ok: true });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        }),
      );
    });
  });

  describe('put', () => {
    it('should make a PUT request', async () => {
      mockResponse(200, { updated: true });

      const result = await api.put('/update', { name: 'new' });

      expect(result).toEqual({ updated: true });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/update'),
        expect.objectContaining({ method: 'PUT' }),
      );
    });
  });

  describe('delete', () => {
    it('should make a DELETE request', async () => {
      mockResponse(200, { deleted: true });

      const result = await api.delete('/users/me');

      expect(result).toEqual({ deleted: true });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/me'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('error handling', () => {
    it('should include status code in error', async () => {
      mockResponse(403, { message: 'Forbidden' });

      try {
        await api.get('/forbidden');
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.statusCode).toBe(403);
        expect(err.message).toBe('Forbidden');
      }
    });

    it('should include response data in error', async () => {
      mockResponse(422, { message: 'Validation failed', errors: ['email required'] });

      try {
        await api.post('/register', {});
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.data.errors).toContain('email required');
      }
    });
  });
});
