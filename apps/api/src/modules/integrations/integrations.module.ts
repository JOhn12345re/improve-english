import { Module } from '@nestjs/common';
import { DictionaryModule } from './dictionary/dictionary.module';
import { DatamuseModule } from './datamuse/datamuse.module';
import { TatoebaModule } from './tatoeba/tatoeba.module';
import { LanguageToolModule } from './languagetool/languagetool.module';
import { TranslationModule } from './translation/translation.module';
import { TtsModule } from './tts/tts.module';
import { LlmModule } from './llm/llm.module';

/**
 * Barrel module for all external API integrations.
 *
 *   ✅ DictionaryModule   — Free Dictionary API (no key)
 *   ✅ DatamuseModule     — Datamuse API (no key)
 *   ✅ TatoebaModule      — Local DB dataset
 *   ✅ LanguageToolModule — Grammar correction (self-hosted Docker)
 *   ✅ TranslationModule  — MyMemory (free) + DeepL (Premium)
 *   ✅ TtsModule          — Amazon Polly + S3 (server-side)
 *   ✅ LlmModule          — Groq LLaMA (free) + Anthropic Claude (Premium)
 */
@Module({
  imports: [
    DictionaryModule,
    DatamuseModule,
    TatoebaModule,
    LanguageToolModule,
    TranslationModule,
    TtsModule,
    LlmModule,
  ],
  exports: [
    DictionaryModule,
    DatamuseModule,
    TatoebaModule,
    LanguageToolModule,
    TranslationModule,
    TtsModule,
    LlmModule,
  ],
})
export class IntegrationsModule {}
