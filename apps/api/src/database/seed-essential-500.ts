/**
 * seed-essential-500.ts
 *
 * Imports 500 essential words from mots-essentiels-500.json into the database.
 * For each word:
 *   - Upserts a VocabularyWord with IPA, POS, frequency, examples, topics
 *   - Generates audio via TTS (Polly) for examples
 *   - Generates an additional example via LLM (Groq)
 *
 * Usage: npx ts-node -r tsconfig-paths/register src/database/seed-essential-500.ts
 */

import { PrismaClient, CefrLevel } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// ── Types ──────────────────────────────────────────────────────────────────

interface RawWordEntry {
  word: string;
  translation_fr: string;
  pos: string;
  phrase: string;
  phrase_fr: string;
  importance: number;
  frequency: string;
}

interface LessonEntry {
  level: string;
  theme: string;
  words: RawWordEntry[];
}

// Flattened entry used internally
interface WordEntry {
  word: string;
  pos: string;
  fr: string;
  level: string;
  theme: string;
  frequency: string;
  importance: number;
  example_en: string;
  example_fr: string;
}

interface SeedReport {
  wordsImported: number;
  wordsSkipped: number;
  audiosGenerated: number;
  audiosCached: number;
  llmExamplesGenerated: number;
  llmErrors: string[];
  ttsErrors: string[];
  totalTokensUsed: number;
  durationMs: number;
}

// ── Config ─────────────────────────────────────────────────────────────────

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const TTS_ENABLED = !!(process.env.AWS_ACCESS_KEY_ID && process.env.POLLY_S3_BUCKET);
const LLM_ENABLED = !!GROQ_API_KEY;

const BATCH_SIZE = 10;
const LLM_DELAY_MS = 500; // avoid rate limiting

// ── Helpers ────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function mapLevel(level: string): CefrLevel {
  const map: Record<string, CefrLevel> = {
    A1: 'A1',
    A2: 'A2',
    B1: 'B1',
    B2: 'B2',
    C1: 'C1',
    C2: 'C2',
  };
  return map[level] || 'A1';
}

function buildTranslationsJson(fr: string): Record<string, string> {
  // For now, only French is provided in the JSON.
  // Other languages will be populated by the exercise generator or i18n pass.
  return { fr, en: '' };
}

// ── LLM Example Generation ────────────────────────────────────────────────

async function generateExampleViaLLM(
  word: string,
  pos: string,
  fr: string,
  allowedWords: string[],
): Promise<{ en: string; fr: string } | null> {
  if (!LLM_ENABLED) return null;

  const systemPrompt = `You generate simple English sentences for language learners.
Use ONLY common, simple words. Return ONLY a JSON object: {"en": "...", "fr": "..."}
No markdown, no explanation.`;

  const prompt = `Generate ONE simple sentence using the word "${word}" (${pos}, meaning "${fr}" in French).
The sentence should be 5-10 words, suitable for A1-B1 learners.
Return JSON: {"en": "English sentence", "fr": "French translation"}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Groq HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json() as any;
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty LLM response');

    // Parse JSON from response (handle markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error(`No JSON in LLM response: ${text}`);

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.en || !parsed.fr) throw new Error('Missing en/fr in response');

    return { en: parsed.en, fr: parsed.fr };
  } catch (err) {
    return null;
  }
}

// ── Main Seed ──────────────────────────────────────────────────────────────

async function seedEssential500(): Promise<SeedReport> {
  const startTime = Date.now();

  const report: SeedReport = {
    wordsImported: 0,
    wordsSkipped: 0,
    audiosGenerated: 0,
    audiosCached: 0,
    llmExamplesGenerated: 0,
    llmErrors: [],
    ttsErrors: [],
    totalTokensUsed: 0,
    durationMs: 0,
  };

  // Load JSON (lesson-based format)
  const jsonPath = path.resolve(
    __dirname,
    '../content/seeds/mots-essentiels-500.json',
  );
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const lessons: LessonEntry[] = JSON.parse(rawData);

  // Flatten lessons into word entries
  const flatWords: WordEntry[] = [];
  for (const lesson of lessons) {
    const baseLevel = lesson.level.includes('-') ? lesson.level.split('-')[0] : lesson.level;
    for (const w of lesson.words) {
      flatWords.push({
        word: w.word,
        pos: w.pos,
        fr: w.translation_fr,
        level: baseLevel,
        theme: lesson.theme,
        frequency: w.frequency,
        importance: w.importance,
        example_en: w.phrase,
        example_fr: w.phrase_fr,
      });
    }
  }

  console.log(`Loaded ${flatWords.length} words from ${lessons.length} lessons`);

  const allWords = flatWords.map((w) => w.word.toLowerCase());

  // Process in batches
  for (let i = 0; i < flatWords.length; i += BATCH_SIZE) {
    const batch = flatWords.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(flatWords.length / BATCH_SIZE);

    console.log(`Processing batch ${batchNum}/${totalBatches}...`);

    for (const entry of batch) {
      try {
        // Build examples array
        const examples: Array<{ en: string; fr: string; audioUrl?: string }> = [
          { en: entry.example_en, fr: entry.example_fr },
        ];

        // Generate additional example via LLM
        if (LLM_ENABLED) {
          const llmExample = await generateExampleViaLLM(
            entry.word,
            entry.pos,
            entry.fr,
            allWords,
          );
          if (llmExample) {
            examples.push(llmExample);
            report.llmExamplesGenerated++;
          } else {
            report.llmErrors.push(`LLM failed for "${entry.word}"`);
          }
          await sleep(LLM_DELAY_MS);
        }

        // Upsert the VocabularyWord
        await prisma.vocabularyWord.upsert({
          where: { word_en: entry.word },
          create: {
            word_en: entry.word,
            translations_json: buildTranslationsJson(entry.fr),
            level: mapLevel(entry.level),
            part_of_speech: entry.pos,
            frequency: entry.frequency,
            importance: entry.importance,
            examples_json: examples,
            topics: [entry.theme],
            pack: 'essentials-500',
          },
          update: {
            translations_json: buildTranslationsJson(entry.fr),
            level: mapLevel(entry.level),
            part_of_speech: entry.pos,
            frequency: entry.frequency,
            importance: entry.importance,
            examples_json: examples,
            topics: [entry.theme],
            pack: 'essentials-500',
          },
        });

        report.wordsImported++;
      } catch (err) {
        console.error(`Error processing "${entry.word}":`, err);
        report.wordsSkipped++;
      }
    }
  }

  report.durationMs = Date.now() - startTime;

  // Write report
  const reportPath = path.resolve(__dirname, '../../seed-essential-500-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to ${reportPath}`);

  return report;
}

// ── Run ────────────────────────────────────────────────────────────────────

seedEssential500()
  .then((report) => {
    console.log('\n=== Seed Essential 500 Complete ===');
    console.log(`Words imported: ${report.wordsImported}`);
    console.log(`Words skipped: ${report.wordsSkipped}`);
    console.log(`LLM examples: ${report.llmExamplesGenerated}`);
    console.log(`LLM errors: ${report.llmErrors.length}`);
    console.log(`Duration: ${(report.durationMs / 1000).toFixed(1)}s`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
