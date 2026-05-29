import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { LlmService } from '../../integrations/llm/llm.service';
import { CefrLevel } from '@englishflow/shared-types';
import {
  CefrLevel as PrismaCefrLevel,
  IngestionStatus,
  RawContent,
} from '@prisma/client';
import { generateReadingComprehension } from './exercise-factories/reading-comprehension.factory';
import { generateFillBlank } from './exercise-factories/fill-blank.factory';
import { generateVocabularyMcq } from './exercise-factories/vocabulary-mcq.factory';
import { generateTranslation } from './exercise-factories/translation.factory';
import { Prisma } from '@prisma/client';

const MAX_LESSONS_PER_CONTENT = 3;
const CHUNK_WORDS_MIN = 400;
const CHUNK_WORDS_MAX = 2000;

@Injectable()
export class LessonGeneratorService {
  private readonly logger = new Logger(LessonGeneratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
  ) {}

  async generateFromRawContent(rawContentId: string): Promise<number> {
    const raw = await this.prisma.rawContent.findUnique({
      where: { id: rawContentId },
    });

    if (!raw || raw.status !== IngestionStatus.CLASSIFIED || !raw.detected_level) {
      this.logger.warn(`Skipping ${rawContentId} — not CLASSIFIED or missing level`);
      return 0;
    }

    await this.prisma.rawContent.update({
      where: { id: rawContentId },
      data: { status: IngestionStatus.GENERATING },
    });

    try {
      const chunks = splitIntoChunks(raw.text, raw.word_count);
      const toProcess = chunks.slice(0, MAX_LESSONS_PER_CONTENT);

      let created = 0;
      for (let i = 0; i < toProcess.length; i++) {
        const lesson = await this.generateLesson(raw, toProcess[i], i + 1, toProcess.length);
        if (lesson) created++;
      }

      await this.prisma.rawContent.update({
        where: { id: rawContentId },
        data: {
          status: IngestionStatus.COMPLETED,
          processed_at: new Date(),
        },
      });

      this.logger.log(`Generated ${created} lesson(s) from ${rawContentId}`);
      return created;
    } catch (err) {
      this.logger.error(`Failed to generate lessons for ${rawContentId}: ${(err as Error).message}`);
      await this.prisma.rawContent.update({
        where: { id: rawContentId },
        data: { status: IngestionStatus.FAILED },
      }).catch(() => {});
      return 0;
    }
  }

  async generateBatch(ids: string[]): Promise<number> {
    let total = 0;
    for (const id of ids) {
      total += await this.generateFromRawContent(id);
    }
    return total;
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private async generateLesson(
    raw: RawContent,
    passage: string,
    partIndex: number,
    totalParts: number,
  ): Promise<boolean> {
    const level = raw.detected_level as unknown as CefrLevel;

    // Generate title + description via LLM
    const meta = await this.generateMeta(raw.title, passage, level, partIndex, totalParts);

    // Build exercises: 30% vocab MCQ, 30% fill-blank, 20% reading comp, 10% translation, 10% bonus MCQ
    const [rc, fill, vocab, translation] = await Promise.allSettled([
      generateReadingComprehension(this.llm, passage, level),
      generateFillBlank(this.llm, passage, level),
      generateVocabularyMcq(this.llm, passage, level),
      generateTranslation(this.llm, passage, level),
    ]);

    const exercises: unknown[] = [];

    // Vocabulary MCQ (30%)
    if (vocab.status === 'fulfilled' && vocab.value) {
      for (const item of vocab.value.items.slice(0, 3)) {
        exercises.push({
          type: 'mcq',
          question: item.question,
          questionFr: item.questionFr,
          options: item.options,
          correctIndex: item.correctIndex,
          explanation: `"${item.word}" — ${item.explanationFr}`,
          explanationFr: item.explanationFr,
        });
      }
    }

    // Fill-blank (30%)
    if (fill.status === 'fulfilled' && fill.value) {
      for (const item of fill.value.items.slice(0, 3)) {
        exercises.push({
          type: 'fill',
          sentence: item.sentence,
          sentenceFr: item.sentenceFr,
          answer: item.answer,
          options: item.options,
        });
      }
    }

    // Reading comprehension (20%)
    if (rc.status === 'fulfilled' && rc.value) {
      for (const q of rc.value.questions.slice(0, 2)) {
        exercises.push({
          type: 'mcq',
          question: q.question,
          questionFr: q.question, // RC questions are already in English context
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          explanationFr: q.explanation,
          passage: passage.slice(0, 500), // attach truncated passage for context
        });
      }
    }

    // Translation (10%)
    if (translation.status === 'fulfilled' && translation.value) {
      for (const item of translation.value.items.slice(0, 2)) {
        exercises.push({
          type: 'translation',
          instructionFr: item.instructionFr ?? 'Traduisez cette phrase en anglais.',
          instructionEn: 'Translate this sentence into English.',
          sourceFr: item.sourceFr,
          targetEn: item.targetEn,
          ...(item.hint ? { hint: item.hint } : {}),
        });
      }
    }

    if (exercises.length < 3) {
      this.logger.warn(`Too few exercises generated for ${raw.id} part ${partIndex} — skipping`);
      return false;
    }

    // Find the next available order for this level
    const maxOrder = await this.prisma.lesson.aggregate({
      where: { level: raw.detected_level as PrismaCefrLevel },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? 0) + 1;

    await this.prisma.lesson.create({
      data: {
        level: raw.detected_level as PrismaCefrLevel,
        theme: raw.topics[0] ?? 'general',
        order,
        is_premium: false,
        raw_content_id: raw.id,
        content_json: {
          title: meta.title,
          description: meta.description,
          source: { url: raw.source_url, name: raw.source },
          exercises,
        } as Prisma.InputJsonValue,
      },
    });

    return true;
  }

  private async generateMeta(
    rawTitle: string,
    passage: string,
    level: CefrLevel,
    part: number,
    total: number,
  ): Promise<{ title: { fr: string; en: string }; description: { fr: string; en: string } }> {
    const suffix = total > 1 ? ` (Part ${part}/${total})` : '';

    try {
      const prompt = `
Based on this English passage for a CEFR ${level} learner, generate a lesson title and short description.

Passage excerpt: "${passage.slice(0, 300)}..."

Return ONLY valid JSON:
{
  "titleEn": "Concise English lesson title (max 6 words)${suffix}",
  "titleFr": "French translation of the title",
  "descriptionEn": "One sentence describing what the learner will practice (max 20 words)",
  "descriptionFr": "French translation of the description"
}
`.trim();

      const result = await this.llm.generate(prompt, { maxTokens: 150, temperature: 0.3 });
      const json = result.text.match(/\{[\s\S]*\}/)?.[0] ?? '{}';
      const parsed = JSON.parse(json);

      return {
        title: {
          en: (parsed.titleEn ?? rawTitle + suffix).slice(0, 80),
          fr: (parsed.titleFr ?? rawTitle + suffix).slice(0, 80),
        },
        description: {
          en: (parsed.descriptionEn ?? '').slice(0, 200),
          fr: (parsed.descriptionFr ?? '').slice(0, 200),
        },
      };
    } catch {
      return {
        title: { en: rawTitle + suffix, fr: rawTitle + suffix },
        description: { en: 'Practice English with real-world content.', fr: 'Pratiquez l\'anglais avec du contenu authentique.' },
      };
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function splitIntoChunks(text: string, wordCount: number): string[] {
  if (wordCount <= 500) return [text];

  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';
  let currentWords = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.split(/\s+/).length;

    if (currentWords + sentenceWords > CHUNK_WORDS_MAX && current) {
      if (currentWords >= CHUNK_WORDS_MIN) {
        chunks.push(current.trim());
        current = sentence;
        currentWords = sentenceWords;
      } else {
        current += ' ' + sentence;
        currentWords += sentenceWords;
      }
    } else {
      current += ' ' + sentence;
      currentWords += sentenceWords;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}
