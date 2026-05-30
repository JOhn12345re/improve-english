import { PrismaClient } from '@prisma/client';
import { seedLessons } from '../src/database/seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed lessons (50 lessons with full exercises from src/database/seed.ts)
  await seedLessons(prisma);

  // Seed vocabulaire de base A1
  const A1_WORDS = [
    { word_en: 'hello', level: 'A1', translations_json: { fr: 'bonjour', es: 'hola', it: 'ciao', ar: '\u0645\u0631\u062D\u0628\u0627', pt: 'ol\u00E1', de: 'hallo', en: 'hello' } },
    { word_en: 'goodbye', level: 'A1', translations_json: { fr: 'au revoir', es: 'adi\u00F3s', it: 'arrivederci', ar: '\u0648\u062F\u0627\u0639\u0627', pt: 'adeus', de: 'auf Wiedersehen', en: 'goodbye' } },
    { word_en: 'please', level: 'A1', translations_json: { fr: 's\'il vous pla\u00EEt', es: 'por favor', it: 'per favore', ar: '\u0645\u0646 \u0641\u0636\u0644\u0643', pt: 'por favor', de: 'bitte', en: 'please' } },
    { word_en: 'thank you', level: 'A1', translations_json: { fr: 'merci', es: 'gracias', it: 'grazie', ar: '\u0634\u0643\u0631\u0627', pt: 'obrigado', de: 'danke', en: 'thank you' } },
    { word_en: 'yes', level: 'A1', translations_json: { fr: 'oui', es: 's\u00ED', it: 's\u00EC', ar: '\u0646\u0639\u0645', pt: 'sim', de: 'ja', en: 'yes' } },
    { word_en: 'no', level: 'A1', translations_json: { fr: 'non', es: 'no', it: 'no', ar: '\u0644\u0627', pt: 'n\u00E3o', de: 'nein', en: 'no' } },
    { word_en: 'water', level: 'A1', translations_json: { fr: 'eau', es: 'agua', it: 'acqua', ar: '\u0645\u0627\u0621', pt: '\u00E1gua', de: 'Wasser', en: 'water' } },
    { word_en: 'house', level: 'A1', translations_json: { fr: 'maison', es: 'casa', it: 'casa', ar: '\u0628\u064A\u062A', pt: 'casa', de: 'Haus', en: 'house' } },
    { word_en: 'friend', level: 'A1', translations_json: { fr: 'ami', es: 'amigo', it: 'amico', ar: '\u0635\u062F\u064A\u0642', pt: 'amigo', de: 'Freund', en: 'friend' } },
    { word_en: 'work', level: 'A1', translations_json: { fr: 'travail', es: 'trabajo', it: 'lavoro', ar: '\u0639\u0645\u0644', pt: 'trabalho', de: 'Arbeit', en: 'work' } },
  ];

  const vocabCount = await prisma.vocabularyWord.count();
  if (vocabCount === 0) {
    await prisma.vocabularyWord.createMany({
      data: A1_WORDS.map((w) => ({ ...w, level: w.level as never })),
    });
    console.log(`Seeded ${A1_WORDS.length} vocabulary words.`);
  } else {
    console.log(`Vocabulary already seeded (${vocabCount} words). Skipping.`);
  }

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
