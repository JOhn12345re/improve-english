import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, '../src/content/seeds/100-essential-words.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  let created = 0;
  let skipped = 0;

  for (const [category, words] of Object.entries(data)) {
    for (const w of words as any[]) {
      const wordEn = w.word;

      const existing = await prisma.vocabularyWord.findUnique({
        where: { word_en: wordEn },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.vocabularyWord.create({
        data: {
          word_en: wordEn,
          level: 'A1',
          translations_json: {
            fr: w.fr,
            ipa: w.ipa,
            pos: w.pos,
            example_en: w.example_en,
            example_fr: w.example_fr,
            category,
          },
        },
      });
      created++;
    }
  }

  console.log(`Done! Created: ${created}, Skipped (already exist): ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
