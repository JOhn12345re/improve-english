/**
 * Typed configuration factory for @nestjs/config.
 * Usage: ConfigModule.forRoot({ load: [configuration], validate })
 */
export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  database: {
    url: process.env.DATABASE_URL ?? '',
  },

  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },

  languagetool: {
    url: process.env.LANGUAGETOOL_URL ?? 'http://localhost:8010/v2',
    apiKey: process.env.LANGUAGETOOL_API_KEY ?? '',
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY ?? '',
    model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
  },

  deepl: {
    apiKey: process.env.DEEPL_API_KEY ?? '',
    apiUrl: process.env.DEEPL_API_URL ?? 'https://api-free.deepl.com/v2',
  },

  aws: {
    region: process.env.AWS_REGION ?? 'eu-west-3',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  },

  polly: {
    voiceId: process.env.POLLY_VOICE_ID ?? 'Joanna',
    s3Bucket: process.env.POLLY_S3_BUCKET ?? '',
  },

  s3: {
    publicUrl: process.env.S3_PUBLIC_URL ?? '',
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
  },
});
