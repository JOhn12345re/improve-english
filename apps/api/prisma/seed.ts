import { PrismaClient, CefrLevel } from '@prisma/client';
import { seedLessons } from '../src/database/seed';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ── Types for mots-essentiels-500.json ────────────────────────────────────

interface RawWord {
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
  words: RawWord[];
}

function mapLevel(level: string): CefrLevel {
  const clean = level.replace('-', '_').split('_')[0]; // "A1-A2" → "A1"
  const map: Record<string, CefrLevel> = { A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2' };
  return map[clean] || 'A1';
}

// ── Seed Essential 500 ────────────────────────────────────────────────────

async function seedEssential500() {
  const jsonPath = path.resolve(__dirname, '../src/content/seeds/mots-essentiels-500.json');

  if (!fs.existsSync(jsonPath)) {
    console.log('mots-essentiels-500.json not found, skipping essential vocabulary seed.');
    return;
  }

  const lessons: LessonEntry[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  let upserted = 0;

  for (const lesson of lessons) {
    for (const w of lesson.words) {
      const wordKey = w.word.toLowerCase().trim();

      await prisma.vocabularyWord.upsert({
        where: { word_en: wordKey },
        create: {
          word_en: wordKey,
          translations_json: { fr: w.translation_fr },
          level: mapLevel(lesson.level),
          part_of_speech: w.pos,
          frequency: w.frequency,
          importance: w.importance,
          examples_json: [{ en: w.phrase, fr: w.phrase_fr }],
          topics: [lesson.theme],
          pack: 'essentials-500',
        },
        update: {
          translations_json: { fr: w.translation_fr },
          level: mapLevel(lesson.level),
          part_of_speech: w.pos,
          frequency: w.frequency,
          importance: w.importance,
          examples_json: [{ en: w.phrase, fr: w.phrase_fr }],
          topics: [lesson.theme],
          pack: 'essentials-500',
        },
      });
      upserted++;
    }
  }

  console.log(`Seeded ${upserted} essential vocabulary words.`);
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding database...');

  // Seed lessons
  await seedLessons(prisma);

  // Seed 500 essential vocabulary words
  await seedEssential500();

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
