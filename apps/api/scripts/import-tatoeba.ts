/**
 * Tatoeba import script
 * ─────────────────────
 * Downloads EN + target-language sentence files from Tatoeba, matches them
 * via the links file, estimates CEFR level, and bulk-inserts into Postgres.
 *
 * Usage:
 *   npx ts-node scripts/import-tatoeba.ts [--lang fra] [--limit 50000]
 *
 * Prerequisites:
 *   - Postgres running and DATABASE_URL set in apps/api/.env
 *   - `bunzip2` available in PATH (comes with most Linux/macOS installs)
 *     On Windows: install via WSL, Git Bash, or 7-Zip
 *
 * Data source: https://tatoeba.org/eng/downloads
 *   Sentences are released under CC BY 2.0 FR
 */

import { execSync } from 'child_process';
import { createInterface } from 'readline';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import { PrismaClient, CefrLevel } from '@prisma/client';

// ── CLI args ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (flag: string, def: string) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : def;
};

const TARGET_LANG = getArg('--lang', 'fra');   // Tatoeba ISO 639-3 code
const LIMIT       = parseInt(getArg('--limit', '100000'), 10);
const DATA_DIR    = path.join(__dirname, '../tmp/tatoeba');
const BATCH_SIZE  = 500;

// ── CEFR heuristic ─────────────────────────────────────────────────────────

function estimateCefrLevel(text: string): CefrLevel {
  const len = text.trim().length;
  if (len <= 20)  return CefrLevel.A1;
  if (len <= 35)  return CefrLevel.A2;
  if (len <= 55)  return CefrLevel.B1;
  if (len <= 80)  return CefrLevel.B2;
  if (len <= 120) return CefrLevel.C1;
  return CefrLevel.C2;
}

// ── Download helpers ────────────────────────────────────────────────────────

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      console.log(`  [skip] ${path.basename(dest)} already exists`);
      return resolve();
    }
    console.log(`  [download] ${url}`);
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let downloaded = 0;
      res.on('data', (chunk: Buffer) => {
        downloaded += chunk.length;
        process.stdout.write(`\r  ${(downloaded / 1_048_576).toFixed(1)} MB`);
      });
      res.pipe(file);
      file.on('finish', () => { file.close(); console.log(''); resolve(); });
    }).on('error', reject);
  });
}

function decompressBz2(src: string, dest: string): void {
  if (fs.existsSync(dest)) {
    console.log(`  [skip] ${path.basename(dest)} already decompressed`);
    return;
  }
  console.log(`  [decompress] ${path.basename(src)}`);
  fs.copyFileSync(src, dest + '.bz2');
  execSync(`bunzip2 -f "${dest}.bz2"`);
}

// ── TSV parser ─────────────────────────────────────────────────────────────

async function parseSentences(
  filePath: string,
  targetLang: string,
): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  const rl = createInterface({ input: fs.createReadStream(filePath) });

  for await (const line of rl) {
    const [idStr, lang, text] = line.split('\t');
    if (lang === targetLang && text) {
      map.set(parseInt(idStr, 10), text.trim());
    }
  }
  return map;
}

async function parseLinks(
  filePath: string,
  engIds: Set<number>,
  targetIds: Set<number>,
): Promise<Array<[number, number]>> {
  const pairs: Array<[number, number]> = [];
  const rl = createInterface({ input: fs.createReadStream(filePath) });

  for await (const line of rl) {
    const [aStr, bStr] = line.split('\t');
    const a = parseInt(aStr, 10);
    const b = parseInt(bStr, 10);

    if (engIds.has(a) && targetIds.has(b)) {
      pairs.push([a, b]);
    } else if (engIds.has(b) && targetIds.has(a)) {
      pairs.push([b, a]);  // link is bidirectional in the file
    }

    if (pairs.length >= LIMIT) break;
  }
  return pairs;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const engBz2    = path.join(DATA_DIR, 'eng_sentences.tsv.bz2');
  const targetBz2 = path.join(DATA_DIR, `${TARGET_LANG}_sentences.tsv.bz2`);
  const linksBz2  = path.join(DATA_DIR, 'links.csv.bz2');

  const engTsv    = path.join(DATA_DIR, 'eng_sentences.tsv');
  const targetTsv = path.join(DATA_DIR, `${TARGET_LANG}_sentences.tsv`);
  const linksCsv  = path.join(DATA_DIR, 'links.csv');

  // 1. Download
  console.log('\n[1/5] Downloading Tatoeba data files…');
  const base = 'https://downloads.tatoeba.org/exports';
  await downloadFile(`${base}/per_language/eng/eng_sentences.tsv.bz2`, engBz2);
  await downloadFile(`${base}/per_language/${TARGET_LANG}/${TARGET_LANG}_sentences.tsv.bz2`, targetBz2);
  await downloadFile(`${base}/links.csv.bz2`, linksBz2);

  // 2. Decompress
  console.log('\n[2/5] Decompressing…');
  decompressBz2(engBz2, engTsv);
  decompressBz2(targetBz2, targetTsv);
  decompressBz2(linksBz2, linksCsv);

  // 3. Parse
  console.log('\n[3/5] Parsing sentences…');
  const engSentences    = await parseSentences(engTsv, 'eng');
  const targetSentences = await parseSentences(targetTsv, TARGET_LANG);
  console.log(`  eng: ${engSentences.size.toLocaleString()} sentences`);
  console.log(`  ${TARGET_LANG}: ${targetSentences.size.toLocaleString()} sentences`);

  console.log('\n[4/5] Matching pairs via links (limit: ' + LIMIT.toLocaleString() + ')…');
  const pairs = await parseLinks(linksCsv, new Set(engSentences.keys()), new Set(targetSentences.keys()));
  console.log(`  ${pairs.length.toLocaleString()} pairs found`);

  // 4. Import into Postgres
  console.log('\n[5/5] Importing into Postgres…');
  const prisma = new PrismaClient();
  await prisma.$connect();

  // Upsert English sentences
  const uniqueEngIds = [...new Set(pairs.map(([engId]) => engId))];
  for (let i = 0; i < uniqueEngIds.length; i += BATCH_SIZE) {
    const batch = uniqueEngIds.slice(i, i + BATCH_SIZE);
    await prisma.$transaction(
      batch.map((id) => {
        const text = engSentences.get(id)!;
        return prisma.tatoebaSentence.upsert({
          where: { id },
          update: {},
          create: {
            id,
            lang: 'eng',
            text,
            lengthChars: text.length,
            cecrlLevel: estimateCefrLevel(text),
          },
        });
      }),
    );
    process.stdout.write(`\r  eng sentences: ${Math.min(i + BATCH_SIZE, uniqueEngIds.length).toLocaleString()} / ${uniqueEngIds.length.toLocaleString()}`);
  }
  console.log('');

  // Upsert target sentences
  const uniqueTargetIds = [...new Set(pairs.map(([, targetId]) => targetId))];
  for (let i = 0; i < uniqueTargetIds.length; i += BATCH_SIZE) {
    const batch = uniqueTargetIds.slice(i, i + BATCH_SIZE);
    await prisma.$transaction(
      batch.map((id) => {
        const text = targetSentences.get(id)!;
        return prisma.tatoebaSentence.upsert({
          where: { id },
          update: {},
          create: {
            id,
            lang: TARGET_LANG,
            text,
            lengthChars: text.length,
            cecrlLevel: estimateCefrLevel(text),
          },
        });
      }),
    );
    process.stdout.write(`\r  ${TARGET_LANG} sentences: ${Math.min(i + BATCH_SIZE, uniqueTargetIds.length).toLocaleString()} / ${uniqueTargetIds.length.toLocaleString()}`);
  }
  console.log('');

  // Upsert links
  for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
    const batch = pairs.slice(i, i + BATCH_SIZE);
    await prisma.$transaction(
      batch.map(([sourceId, targetId]) =>
        prisma.tatoebaLink.upsert({
          where: { sourceId_targetId: { sourceId, targetId } },
          update: {},
          create: { sourceId, targetId, sourceLang: 'eng', targetLang: TARGET_LANG },
        }),
      ),
    );
    process.stdout.write(`\r  links: ${Math.min(i + BATCH_SIZE, pairs.length).toLocaleString()} / ${pairs.length.toLocaleString()}`);
  }
  console.log('');

  await prisma.$disconnect();

  console.log('\n✓ Tatoeba import complete!');
  console.log(`  ${pairs.length.toLocaleString()} EN↔${TARGET_LANG} pairs imported.`);
}

main().catch((err) => {
  console.error('\nImport failed:', err);
  process.exit(1);
});
