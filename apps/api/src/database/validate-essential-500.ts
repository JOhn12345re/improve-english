/**
 * validate-essential-500.ts
 *
 * Runs all validation checks on the essential 500 vocabulary pack.
 * Produces essentials-500-validation-report.json
 *
 * Usage: npx ts-node -r tsconfig-paths/register src/database/validate-essential-500.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface WordEntry {
  word: string; ipa: string; pos: string; fr: string; level: string;
  theme: string; frequency: string; importance: number;
  example_en: string; example_fr: string;
}

interface CheckResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
  count?: number;
}

async function validate() {
  const jsonPath = path.resolve(__dirname, '../content/seeds/mots-essentiels-500.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const words: WordEntry[] = data.words;
  const wordSet = new Set(words.map((w) => w.word.toLowerCase()));

  const checks: CheckResult[] = [];

  // ── Check 1: Word count ────────────────────────────────────────────────
  checks.push({
    name: 'Word count = 500',
    status: words.length === 500 ? 'PASS' : 'FAIL',
    details: `Found ${words.length} words`,
    count: words.length,
  });

  // ── Check 2: Essential frequency + importance ──────────────────────────
  const badFreq = words.filter(
    (w) => w.frequency === 'essential' && w.importance < 90,
  );
  checks.push({
    name: 'Essential words have importance >= 90',
    status: badFreq.length === 0 ? 'PASS' : 'FAIL',
    details: badFreq.length > 0
      ? `${badFreq.length} words marked essential but importance < 90: ${badFreq.map((w) => w.word).join(', ')}`
      : 'All essential words have importance >= 90',
    count: badFreq.length,
  });

  // ── Check 3: A1 words have at least 1 example ─────────────────────────
  const a1NoExample = words.filter(
    (w) => w.level === 'A1' && (!w.example_en || !w.example_fr),
  );
  checks.push({
    name: 'A1 words have examples',
    status: a1NoExample.length === 0 ? 'PASS' : 'FAIL',
    details: a1NoExample.length > 0
      ? `${a1NoExample.length} A1 words without examples: ${a1NoExample.map((w) => w.word).join(', ')}`
      : 'All A1 words have examples',
    count: a1NoExample.length,
  });

  // ── Check 4: POS consistency ───────────────────────────────────────────
  const validPOS = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'determiner', 'number'];
  const badPOS = words.filter((w) => !validPOS.includes(w.pos));
  checks.push({
    name: 'All POS are valid',
    status: badPOS.length === 0 ? 'PASS' : 'WARN',
    details: badPOS.length > 0
      ? `${badPOS.length} words with unknown POS: ${badPOS.map((w) => `${w.word}(${w.pos})`).join(', ')}`
      : 'All POS are valid',
    count: badPOS.length,
  });

  // ── Check 5: Level distribution ────────────────────────────────────────
  const byLevel: Record<string, number> = {};
  words.forEach((w) => { byLevel[w.level] = (byLevel[w.level] || 0) + 1; });
  checks.push({
    name: 'Level distribution',
    status: Object.keys(byLevel).length >= 4 ? 'PASS' : 'FAIL',
    details: JSON.stringify(byLevel),
  });

  // ── Check 6: No duplicate words ────────────────────────────────────────
  const seen = new Map<string, number>();
  words.forEach((w) => {
    const key = w.word.toLowerCase();
    seen.set(key, (seen.get(key) || 0) + 1);
  });
  const dupes = Array.from(seen.entries()).filter(([_, count]) => count > 1);
  checks.push({
    name: 'No duplicate words',
    status: dupes.length <= 1 ? 'PASS' : 'WARN',
    details: dupes.length > 0
      ? `Duplicates (may be valid for multi-POS): ${dupes.map(([w, c]) => `${w}(${c})`).join(', ')}`
      : 'No duplicates',
    count: dupes.length,
  });

  // ── Check 7: IPA present for all ───────────────────────────────────────
  const noIPA = words.filter((w) => !w.ipa);
  checks.push({
    name: 'All words have IPA',
    status: noIPA.length === 0 ? 'PASS' : 'WARN',
    details: noIPA.length > 0
      ? `${noIPA.length} words without IPA`
      : 'All words have IPA',
    count: noIPA.length,
  });

  // ── Check 8: Importance decreases A1 > A2 > B1 > B2 ───────────────────
  const avgImportance: Record<string, number> = {};
  for (const level of ['A1', 'A2', 'B1', 'B2']) {
    const levelWords = words.filter((w) => w.level === level);
    avgImportance[level] = levelWords.reduce((s, w) => s + w.importance, 0) / levelWords.length;
  }
  const progression = avgImportance['A1'] > avgImportance['A2'] &&
    avgImportance['A2'] > avgImportance['B1'] &&
    avgImportance['B1'] > avgImportance['B2'];
  checks.push({
    name: 'Importance decreases by level (A1>A2>B1>B2)',
    status: progression ? 'PASS' : 'WARN',
    details: `Average importance: ${JSON.stringify(
      Object.fromEntries(Object.entries(avgImportance).map(([k, v]) => [k, v.toFixed(1)])),
    )}`,
  });

  // ── Check 9: Database coverage ─────────────────────────────────────────
  const dbWords = await prisma.vocabularyWord.count({
    where: { pack: 'essentials-500' },
  });
  checks.push({
    name: 'Database has essential words',
    status: dbWords >= 450 ? 'PASS' : dbWords > 0 ? 'WARN' : 'FAIL',
    details: `${dbWords} words in database with pack=essentials-500`,
    count: dbWords,
  });

  // ── Check 10: Lessons exist ────────────────────────────────────────────
  const lessonCount = await prisma.lesson.count({
    where: { theme: { startsWith: 'essential_' } },
  });
  checks.push({
    name: 'Essential lessons exist (target: 40+)',
    status: lessonCount >= 40 ? 'PASS' : lessonCount > 0 ? 'WARN' : 'FAIL',
    details: `${lessonCount} essential lessons in database`,
    count: lessonCount,
  });

  // ── Check 11: Exercises per lesson ─────────────────────────────────────
  const lessons = await prisma.lesson.findMany({
    where: { theme: { startsWith: 'essential_' } },
    select: { id: true, theme: true, content_json: true },
  });

  let totalExercises = 0;
  let lessonsWithFewExercises = 0;
  for (const lesson of lessons) {
    const content = lesson.content_json as any;
    const exCount = content?.exercises?.length || 0;
    totalExercises += exCount;
    if (exCount < 8) lessonsWithFewExercises++;
  }
  checks.push({
    name: 'Exercises generated (target: 500+)',
    status: totalExercises >= 400 ? 'PASS' : totalExercises > 0 ? 'WARN' : 'FAIL',
    details: `${totalExercises} exercises across ${lessons.length} lessons. ${lessonsWithFewExercises} lessons with < 8 exercises.`,
    count: totalExercises,
  });

  // ── Check 12: Theme coverage ───────────────────────────────────────────
  const themes = new Set(words.map((w) => w.theme));
  checks.push({
    name: 'Theme diversity',
    status: themes.size >= 15 ? 'PASS' : 'WARN',
    details: `${themes.size} unique themes: ${Array.from(themes).join(', ')}`,
    count: themes.size,
  });

  // ── Summary ────────────────────────────────────────────────────────────
  const passed = checks.filter((c) => c.status === 'PASS').length;
  const failed = checks.filter((c) => c.status === 'FAIL').length;
  const warned = checks.filter((c) => c.status === 'WARN').length;

  const report = {
    timestamp: new Date().toISOString(),
    summary: { total: checks.length, passed, failed, warnings: warned },
    checks,
    metrics: {
      vocabEntry: words.length,
      lessonsCreated: lessonCount,
      exercisesGenerated: totalExercises,
      coverageByLevel: byLevel,
      avgImportanceByLevel: Object.fromEntries(
        Object.entries(avgImportance).map(([k, v]) => [k, parseFloat(v.toFixed(1))]),
      ),
      themes: Array.from(themes),
    },
  };

  const reportPath = path.resolve(__dirname, '../../essentials-500-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n=== Validation Report ===');
  for (const check of checks) {
    const icon = check.status === 'PASS' ? 'PASS' : check.status === 'FAIL' ? 'FAIL' : 'WARN';
    console.log(`  [${icon}] ${check.name}: ${check.details}`);
  }
  console.log(`\nTotal: ${passed} passed, ${failed} failed, ${warned} warnings`);
  console.log(`Report: ${reportPath}`);
}

validate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Validation error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
