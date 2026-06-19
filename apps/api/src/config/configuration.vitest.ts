import { describe, it, expect, beforeEach, vi } from 'vitest';
import configuration from './configuration';

describe('configuration', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return default values when env vars are not set', () => {
    const config = configuration();

    expect(config.port).toBe(3000);
    expect(config.nodeEnv).toBe('development');
    expect(config.redis.url).toBe('redis://localhost:6379');
    expect(config.jwt.secret).toBe('change-me');
    expect(config.jwt.expiresIn).toBe('7d');
  });

  it('should parse PORT from env', () => {
    vi.stubEnv('PORT', '4000');

    const config = configuration();

    expect(config.port).toBe(4000);
  });

  it('should read DATABASE_URL from env', () => {
    vi.stubEnv('DATABASE_URL', 'postgres://localhost/test');

    const config = configuration();

    expect(config.database.url).toBe('postgres://localhost/test');
  });

  it('should read all API keys from env', () => {
    vi.stubEnv('GROQ_API_KEY', 'groq-key');
    vi.stubEnv('DEEPL_API_KEY', 'deepl-key');
    vi.stubEnv('ANTHROPIC_API_KEY', 'anthropic-key');

    const config = configuration();

    expect(config.groq.apiKey).toBe('groq-key');
    expect(config.deepl.apiKey).toBe('deepl-key');
    expect(config.anthropic.apiKey).toBe('anthropic-key');
  });

  it('should read AWS config from env', () => {
    vi.stubEnv('AWS_REGION', 'us-east-1');
    vi.stubEnv('AWS_ACCESS_KEY_ID', 'AKIA...');
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'secret');

    const config = configuration();

    expect(config.aws.region).toBe('us-east-1');
    expect(config.aws.accessKeyId).toBe('AKIA...');
    expect(config.aws.secretAccessKey).toBe('secret');
  });

  it('should default Polly voice to Joanna', () => {
    const config = configuration();

    expect(config.polly.voiceId).toBe('Joanna');
  });

  it('should default Groq model to llama-3.3-70b-versatile', () => {
    const config = configuration();

    expect(config.groq.model).toBe('llama-3.3-70b-versatile');
  });
});
