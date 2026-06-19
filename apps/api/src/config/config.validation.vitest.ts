import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { validate } from './config.validation';

describe('config validation', () => {
  const validConfig = {
    DATABASE_URL: 'postgres://localhost/test',
    JWT_SECRET: 'super-secret',
  };

  it('should accept valid config with required fields', () => {
    const result = validate(validConfig);

    expect(result.DATABASE_URL).toBe('postgres://localhost/test');
    expect(result.JWT_SECRET).toBe('super-secret');
  });

  it('should apply default values for optional fields', () => {
    const result = validate(validConfig);

    expect(result.PORT).toBe(3000);
    expect(result.REDIS_URL).toBe('redis://localhost:6379');
    expect(result.GROQ_MODEL).toBe('llama-3.3-70b-versatile');
  });

  it('should throw when DATABASE_URL is missing', () => {
    expect(() => validate({ JWT_SECRET: 'x' })).toThrow('Configuration validation failed');
  });

  it('should throw when JWT_SECRET is missing', () => {
    expect(() => validate({ DATABASE_URL: 'x' })).toThrow('Configuration validation failed');
  });

  it('should accept valid NODE_ENV values', () => {
    const result = validate({ ...validConfig, NODE_ENV: 'production' });
    expect(result.NODE_ENV).toBe('production');
  });

  it('should throw on invalid NODE_ENV', () => {
    expect(() => validate({ ...validConfig, NODE_ENV: 'invalid' })).toThrow();
  });

  it('should parse PORT as integer', () => {
    const result = validate({ ...validConfig, PORT: '8080' });
    expect(result.PORT).toBe(8080);
  });
});
