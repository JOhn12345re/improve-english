import { IsEnum, IsInt, IsOptional, IsString, Min, validateSync } from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  PORT = 3000;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  REDIS_URL = 'redis://localhost:6379';

  @IsString()
  @IsOptional()
  LANGUAGETOOL_URL = 'http://localhost:8010/v2';

  @IsString()
  @IsOptional()
  LANGUAGETOOL_API_KEY = '';

  @IsString()
  @IsOptional()
  GROQ_API_KEY = '';

  @IsString()
  @IsOptional()
  GROQ_MODEL = 'llama-3.3-70b-versatile';

  @IsString()
  @IsOptional()
  DEEPL_API_KEY = '';

  @IsString()
  @IsOptional()
  DEEPL_API_URL = 'https://api-free.deepl.com/v2';

  @IsString()
  @IsOptional()
  AWS_REGION = 'eu-west-3';

  @IsString()
  @IsOptional()
  AWS_ACCESS_KEY_ID = '';

  @IsString()
  @IsOptional()
  AWS_SECRET_ACCESS_KEY = '';

  @IsString()
  @IsOptional()
  POLLY_VOICE_ID = 'Joanna';

  @IsString()
  @IsOptional()
  POLLY_S3_BUCKET = '';

  @IsString()
  @IsOptional()
  S3_PUBLIC_URL = '';

  @IsString()
  @IsOptional()
  ANTHROPIC_API_KEY = '';

  @IsString()
  @IsOptional()
  OPENAI_API_KEY = '';
}

/**
 * Validates environment variables on startup.
 * Pass to ConfigModule.forRoot({ validate }).
 * Throws a descriptive error on startup if required vars are missing.
 */
export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed:\n${errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('\n')}`,
    );
  }
  return validated;
}
