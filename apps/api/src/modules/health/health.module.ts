import { Controller, Get, Module } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { DictionaryService } from '../integrations/dictionary/dictionary.service';
import { DatamuseService } from '../integrations/datamuse/datamuse.service';
import { LanguageToolService } from '../integrations/languagetool/languagetool.service';
import { TranslationService } from '../integrations/translation/translation.service';
import { TtsService } from '../integrations/tts/tts.service';
import { LlmService } from '../integrations/llm/llm.service';
import { IntegrationsModule } from '../integrations/integrations.module';

@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly dictionary: DictionaryService,
    private readonly datamuse: DatamuseService,
    private readonly languagetool: LanguageToolService,
    private readonly translation: TranslationService,
    private readonly tts: TtsService,
    private readonly llm: LlmService,
  ) {}

  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('integrations')
  async checkIntegrations() {
    const [dictionary, datamuse, languagetool, translation, tts, llm] =
      await Promise.allSettled([
        this.dictionary.ping(),
        this.datamuse.ping(),
        this.languagetool.ping(),
        this.translation.ping(),
        this.tts.ping(),
        this.llm.ping(),
      ]);

    const resolve = <T>(result: PromiseSettledResult<T>, fallback: T): T =>
      result.status === 'fulfilled' ? result.value : fallback;

    const services = {
      dictionary: resolve(dictionary, { status: 'error', latencyMs: 0 }),
      datamuse:   resolve(datamuse,   { status: 'error', latencyMs: 0 }),
      languagetool: resolve(languagetool, { status: 'error', latencyMs: 0 }),
      translation: resolve(translation, {
        mymemory: { status: 'error', latencyMs: 0 },
        deepl:    { status: 'error', latencyMs: 0 },
      }),
      tts: resolve(tts, { status: 'error', latencyMs: 0 }),
      llm: resolve(llm, {
        groq:      { status: 'error', latencyMs: 0 },
        anthropic: { status: 'error', latencyMs: 0 },
      }),
    };

    const allOk = Object.values(services).every((s) => {
      if ('status' in s) return s.status !== 'error';
      return Object.values(s as object).every(
        (sub: any) => sub.status !== 'error',
      );
    });

    return {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
    };
  }
}

@Controller('api/v1')
export class LegacyHealthController {
  @Get('health')
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

@Module({
  imports: [IntegrationsModule],
  controllers: [HealthController, LegacyHealthController],
})
export class HealthModule {}
