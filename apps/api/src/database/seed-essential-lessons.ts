/**
 * seed-essential-lessons.ts
 *
 * Creates 50 thematic lessons from the lesson-based mots-essentiels-500.json.
 * Each lesson gets 10 exercises generated from its word list.
 *
 * Usage: npx ts-node -r tsconfig-paths/register src/database/seed-essential-lessons.ts
 */

import { PrismaClient, CefrLevel } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

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

interface LessonFileEntry {
  level: string;
  theme: string;
  words: RawWordEntry[];
}

// Flattened entry used for exercise generation
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

interface Exercise {
  type: string;
  [key: string]: unknown;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function mapLevel(level: string): CefrLevel {
  // For compound levels like "A1-A2", use the first one
  const base = level.includes('-') ? level.split('-')[0] : level;
  const map: Record<string, CefrLevel> = {
    A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2',
  };
  return map[base] || 'A1';
}

function themeToSlug(theme: string): string {
  return theme
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function flattenWord(w: RawWordEntry, level: string, theme: string): WordEntry {
  return {
    word: w.word,
    pos: w.pos,
    fr: w.translation_fr,
    level,
    theme,
    frequency: w.frequency,
    importance: w.importance,
    example_en: w.phrase,
    example_fr: w.phrase_fr,
  };
}

// ── Exercise Generators ────────────────────────────────────────────────────

function generateMCQ(word: WordEntry, allWords: WordEntry[]): Exercise {
  const distractors = allWords
    .filter((w) => w.word !== word.word && w.pos === word.pos)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((w) => w.fr);

  const options = [word.fr, ...distractors.slice(0, 3)];
  // Shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    type: 'mcq',
    question: `What does "${word.word}" mean?`,
    questionFr: `Que signifie "${word.word}" ?`,
    options,
    correctIndex: options.indexOf(word.fr),
    explanation: `"${word.word}" means "${word.fr}" in French.`,
    explanationFr: `"${word.word}" se traduit par "${word.fr}".`,
  };
}

function generateFillBlank(word: WordEntry): Exercise {
  const sentence = word.example_en.replace(
    new RegExp(`\\b${word.word}\\b`, 'i'),
    '____',
  );
  const finalSentence = sentence.includes('____')
    ? sentence
    : `____ is an important word to know.`;

  return {
    type: 'fill',
    sentence: finalSentence,
    sentenceFr: word.example_fr,
    answer: word.word,
    options: [],
  };
}

function generateTranslation(word: WordEntry): Exercise {
  return {
    type: 'translation',
    instructionEn: 'Translate this sentence into English.',
    instructionFr: 'Traduisez cette phrase en anglais.',
    sourceFr: word.example_fr,
    targetEn: word.example_en,
    hint: word.word,
  };
}

function generateListenType(word: WordEntry): Exercise {
  return {
    type: 'listen_type',
    instruction: 'Listen and type the word you hear.',
    instructionFr: 'Ecoutez et tapez le mot que vous entendez.',
    word: word.word,
    audioUrl: '',
  };
}

function generateWordOrder(word: WordEntry): Exercise {
  const words = word.example_en.replace(/[.,!?]/g, '').split(/\s+/);
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  if (shuffled.join(' ') === words.join(' ')) {
    shuffled.reverse();
  }

  return {
    type: 'word_order',
    instruction: 'Put the words in the correct order.',
    instructionFr: 'Remettez les mots dans le bon ordre.',
    shuffledWords: shuffled,
    correctOrder: words,
    translationFr: word.example_fr,
  };
}

function generateMatchPairs(words: WordEntry[]): Exercise {
  const selected = words.slice(0, Math.min(5, words.length));
  return {
    type: 'match_pairs',
    instruction: 'Match each word with its translation.',
    instructionFr: 'Associez chaque mot a sa traduction.',
    pairs: selected.map((w) => ({ en: w.word, fr: w.fr })),
  };
}

function generateExercisesForLesson(
  lessonWords: WordEntry[],
  allWords: WordEntry[],
): Exercise[] {
  const exercises: Exercise[] = [];
  if (lessonWords.length === 0) return exercises;

  const shuffled = [...lessonWords].sort(() => Math.random() - 0.5);
  const pick = (i: number) => shuffled[i % shuffled.length];

  // 2x MCQ
  exercises.push(generateMCQ(pick(0), allWords));
  exercises.push(generateMCQ(pick(1), allWords));
  // 2x FILL_BLANK
  exercises.push(generateFillBlank(pick(2)));
  exercises.push(generateFillBlank(pick(3)));
  // 2x TRANSLATION
  exercises.push(generateTranslation(pick(4)));
  exercises.push(generateTranslation(pick(5)));
  // 1x LISTEN_TYPE
  exercises.push(generateListenType(pick(6)));
  // 1x WORD_ORDER
  exercises.push(generateWordOrder(pick(7)));
  // 1x MATCH_PAIRS
  exercises.push(generateMatchPairs(shuffled.slice(0, 5)));
  // 1x bonus MCQ
  exercises.push(generateMCQ(pick(8), allWords));

  return exercises;
}

// ── Emoji Map ──────────────────────────────────────────────────────────────

function getEmoji(theme: string): string {
  const lower = theme.toLowerCase();
  if (lower.includes('greet') || lower.includes('polite')) return '\u{1F44B}';
  if (lower.includes('pronoun') || lower.includes('determiner')) return '\u{1F464}';
  if (lower.includes('verb') && lower.includes('action')) return '\u{26A1}';
  if (lower.includes('verb')) return '\u{1F3C3}';
  if (lower.includes('question')) return '\u{2753}';
  if (lower.includes('family') || lower.includes('relationship')) return '\u{1F46A}';
  if (lower.includes('home') || lower.includes('routine')) return '\u{1F3E1}';
  if (lower.includes('food') || lower.includes('drink')) return '\u{1F354}';
  if (lower.includes('travel') || lower.includes('transport')) return '\u{2708}';
  if (lower.includes('shop') || lower.includes('money')) return '\u{1F6D2}';
  if (lower.includes('health') || lower.includes('body')) return '\u{1F3E5}';
  if (lower.includes('clothes') || lower.includes('appearance')) return '\u{1F455}';
  if (lower.includes('time') || lower.includes('number')) return '\u{23F0}';
  if (lower.includes('adjective') || lower.includes('description')) return '\u{2B50}';
  if (lower.includes('connector') || lower.includes('preposition') || lower.includes('discourse')) return '\u{1F517}';
  if (lower.includes('feeling') || lower.includes('emotion') || lower.includes('opinion')) return '\u{1F4AD}';
  if (lower.includes('work') || lower.includes('education') || lower.includes('professional') || lower.includes('business')) return '\u{1F4BC}';
  if (lower.includes('media') || lower.includes('technolog')) return '\u{1F4F1}';
  if (lower.includes('nature') || lower.includes('weather')) return '\u{1F333}';
  if (lower.includes('phrasal')) return '\u{1F504}';
  if (lower.includes('abstract') || lower.includes('concept')) return '\u{1F4A1}';
  if (lower.includes('society') || lower.includes('culture')) return '\u{1F30D}';
  if (lower.includes('formal') || lower.includes('written') || lower.includes('academic')) return '\u{1F393}';
  if (lower.includes('idiom') || lower.includes('expression') || lower.includes('nuance')) return '\u{1F4AC}';
  if (lower.includes('communi') || lower.includes('debate')) return '\u{1F3A4}';
  if (lower.includes('noun')) return '\u{1F4D6}';
  if (lower.includes('survival')) return '\u{1F198}';
  if (lower.includes('people')) return '\u{1F465}';
  return '\u{1F4DA}';
}

// ── Main ───────────────────────────────────────────────────────────────────

async function seedEssentialLessons() {
  const startTime = Date.now();

  // Load lesson-based JSON
  const jsonPath = path.resolve(__dirname, '../content/seeds/mots-essentiels-500.json');
  const lessons: LessonFileEntry[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // Flatten all words for exercise distractor generation
  const allWords: WordEntry[] = [];
  for (const lesson of lessons) {
    for (const w of lesson.words) {
      allWords.push(flattenWord(w, lesson.level, lesson.theme));
    }
  }

  console.log(`Loaded ${lessons.length} lessons with ${allWords.length} total words`);

  let lessonsCreated = 0;
  let exercisesCreated = 0;
  let wordsLinked = 0;
  let order = 1000;

  for (const lesson of lessons) {
    const level = mapLevel(lesson.level);
    const slug = themeToSlug(lesson.theme);
    const lessonWords = lesson.words.map((w) => flattenWord(w, lesson.level, lesson.theme));

    const exercises = generateExercisesForLesson(lessonWords, allWords);

    const title = {
      fr: lesson.theme,
      en: lesson.theme,
      es: lesson.theme,
      it: lesson.theme,
      ar: lesson.theme,
      pt: lesson.theme,
      de: lesson.theme,
    };

    const description = {
      fr: `Apprenez ${lessonWords.length} mots essentiels sur le theme: ${lesson.theme}`,
      en: `Learn ${lessonWords.length} essential words about: ${lesson.theme}`,
      es: `Learn ${lessonWords.length} essential words about: ${lesson.theme}`,
      it: `Learn ${lessonWords.length} essential words about: ${lesson.theme}`,
      ar: `Learn ${lessonWords.length} essential words about: ${lesson.theme}`,
      pt: `Learn ${lessonWords.length} essential words about: ${lesson.theme}`,
      de: `Learn ${lessonWords.length} essential words about: ${lesson.theme}`,
    };

    const contentJson = {
      title,
      description,
      emoji: getEmoji(lesson.theme),
      duration: Math.max(8, Math.min(15, lessonWords.length)),
      xpReward: level === 'A1' ? 30 : level === 'A2' ? 35 : level === 'B1' ? 40 : 50,
      vocabulary: lessonWords.map((w) => ({
        word: w.word,
        pos: w.pos,
        fr: w.fr,
        example_en: w.example_en,
        example_fr: w.example_fr,
      })),
      exercises,
    };

    // Upsert lesson
    const existing = await prisma.lesson.findFirst({
      where: { level, order },
    });

    if (existing) {
      await prisma.lesson.update({
        where: { id: existing.id },
        data: {
          theme: `essential_${slug}`,
          content_json: contentJson as any,
        },
      });
    } else {
      await prisma.lesson.create({
        data: {
          level,
          theme: `essential_${slug}`,
          order,
          content_json: contentJson as any,
          is_premium: false,
        },
      });
    }

    lessonsCreated++;
    exercisesCreated += exercises.length;
    wordsLinked += lessonWords.length;
    order++;

    console.log(
      `  [${lesson.level}] "${lesson.theme}" — ${lessonWords.length} words, ${exercises.length} exercises`,
    );
  }

  const durationMs = Date.now() - startTime;

  const report = {
    lessonsCreated,
    exercisesCreated,
    wordsLinked,
    totalWords: allWords.length,
    durationMs,
  };

  const reportPath = path.resolve(__dirname, '../../seed-essential-lessons-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n=== Seed Essential Lessons Complete ===');
  console.log(`Lessons created: ${lessonsCreated}`);
  console.log(`Exercises created: ${exercisesCreated}`);
  console.log(`Words covered: ${wordsLinked}`);
  console.log(`Duration: ${(durationMs / 1000).toFixed(1)}s`);
  console.log(`Report: ${reportPath}`);
}

// ── Run ────────────────────────────────────────────────────────────────────

seedEssentialLessons()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
