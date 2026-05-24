import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 50 lecons de demo reparties sur A1 -> B2
const LESSONS = [
  // === A1 (15 lecons) ===
  { level: 'A1', theme: 'Greetings & Introductions', order: 1 },
  { level: 'A1', theme: 'Numbers 1–20', order: 2 },
  { level: 'A1', theme: 'Colors & Shapes', order: 3 },
  { level: 'A1', theme: 'Family Members', order: 4 },
  { level: 'A1', theme: 'Days of the Week', order: 5 },
  { level: 'A1', theme: 'Months & Seasons', order: 6 },
  { level: 'A1', theme: 'Common Objects', order: 7 },
  { level: 'A1', theme: 'Body Parts', order: 8 },
  { level: 'A1', theme: 'Food & Drinks', order: 9 },
  { level: 'A1', theme: 'Animals', order: 10 },
  { level: 'A1', theme: 'Classroom Vocabulary', order: 11 },
  { level: 'A1', theme: 'Countries & Nationalities', order: 12 },
  { level: 'A1', theme: 'Simple Present Tense', order: 13 },
  { level: 'A1', theme: 'To Be (am/is/are)', order: 14 },
  { level: 'A1', theme: 'Personal Pronouns', order: 15 },

  // === A2 (15 lecons) ===
  { level: 'A2', theme: 'Daily Routines', order: 1 },
  { level: 'A2', theme: 'At the Supermarket', order: 2 },
  { level: 'A2', theme: 'Telling the Time', order: 3 },
  { level: 'A2', theme: 'Clothes & Shopping', order: 4 },
  { level: 'A2', theme: 'The Weather', order: 5 },
  { level: 'A2', theme: 'Past Simple (regular verbs)', order: 6 },
  { level: 'A2', theme: 'Past Simple (irregular verbs)', order: 7 },
  { level: 'A2', theme: 'Hobbies & Free Time', order: 8 },
  { level: 'A2', theme: 'Transport & Directions', order: 9 },
  { level: 'A2', theme: 'Health & Body', order: 10 },
  { level: 'A2', theme: 'House & Furniture', order: 11 },
  { level: 'A2', theme: 'Adjectives (comparatives)', order: 12 },
  { level: 'A2', theme: 'Can / Can\'t', order: 13 },
  { level: 'A2', theme: 'Questions (Wh-words)', order: 14 },
  { level: 'A2', theme: 'Going to (future plans)', order: 15 },

  // === B1 (12 lecons) ===
  { level: 'B1', theme: 'At the Restaurant', order: 1, is_premium: false },
  { level: 'B1', theme: 'Present Perfect', order: 2, is_premium: false },
  { level: 'B1', theme: 'Travel & Airports', order: 3, is_premium: false },
  { level: 'B1', theme: 'Job Interviews', order: 4, is_premium: false },
  { level: 'B1', theme: 'Conditionals (1st)', order: 5, is_premium: false },
  { level: 'B1', theme: 'Passive Voice (intro)', order: 6, is_premium: false },
  { level: 'B1', theme: 'Technology & Internet', order: 7, is_premium: true },
  { level: 'B1', theme: 'Environment & Ecology', order: 8, is_premium: true },
  { level: 'B1', theme: 'Reported Speech (basics)', order: 9, is_premium: true },
  { level: 'B1', theme: 'Modal Verbs (should, must)', order: 10, is_premium: true },
  { level: 'B1', theme: 'Giving Opinions & Debating', order: 11, is_premium: true },
  { level: 'B1', theme: 'Email & Formal Writing', order: 12, is_premium: true },

  // === B2 (8 lecons) ===
  { level: 'B2', theme: 'Business English', order: 1, is_premium: true },
  { level: 'B2', theme: 'Conditionals (2nd & 3rd)', order: 2, is_premium: true },
  { level: 'B2', theme: 'Idiomatic Expressions', order: 3, is_premium: true },
  { level: 'B2', theme: 'Academic Writing', order: 4, is_premium: true },
  { level: 'B2', theme: 'News & Media Vocabulary', order: 5, is_premium: true },
  { level: 'B2', theme: 'Advanced Grammar: Inversion', order: 6, is_premium: true },
  { level: 'B2', theme: 'Phrasal Verbs (advanced)', order: 7, is_premium: true },
  { level: 'B2', theme: 'Presentation Skills', order: 8, is_premium: true },
];

function generateLessonContent(theme: string, level: string) {
  return {
    title: {
      fr: theme,
      en: theme,
      es: theme,
      it: theme,
      ar: theme,
      pt: theme,
      de: theme,
    },
    description: {
      fr: `Apprenez le vocabulaire et les structures liés au thème : ${theme}`,
      en: `Learn vocabulary and structures related to: ${theme}`,
      es: `Aprende vocabulario y estructuras relacionadas con: ${theme}`,
      it: `Impara il vocabolario e le strutture relative a: ${theme}`,
      ar: `تعلّم المفردات والهياكل المتعلقة بـ: ${theme}`,
      pt: `Aprenda vocabulário e estruturas relacionadas a: ${theme}`,
      de: `Lernen Sie Vokabular und Strukturen zum Thema: ${theme}`,
    },
    estimated_minutes: level === 'A1' ? 8 : level === 'A2' ? 10 : level === 'B1' ? 12 : 15,
    exercises: [
      {
        id: `${theme}-mcq-1`,
        type: 'mcq',
        instruction: {
          fr: 'Choisissez la bonne réponse.',
          en: 'Choose the correct answer.',
          es: 'Elige la respuesta correcta.',
          it: 'Scegli la risposta corretta.',
          ar: 'اختر الإجابة الصحيحة.',
          pt: 'Escolha a resposta correta.',
          de: 'Wähle die richtige Antwort.',
        },
        data: {
          question: `[Sample question for ${theme}]`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct_index: 0,
        },
        xp_reward: 5,
      },
      {
        id: `${theme}-translation-1`,
        type: 'translation',
        instruction: {
          fr: 'Traduisez cette phrase en anglais.',
          en: 'Translate this sentence into English.',
          es: 'Traduce esta frase al inglés.',
          it: 'Traduci questa frase in inglese.',
          ar: 'ترجم هذه الجملة إلى الإنجليزية.',
          pt: 'Traduza esta frase para o inglês.',
          de: 'Übersetze diesen Satz ins Englische.',
        },
        data: {
          source_text: `[Sample phrase for ${theme}]`,
          source_language: 'fr',
          target_text: `[English translation for ${theme}]`,
        },
        xp_reward: 10,
      },
    ],
  };
}

async function main() {
  console.log('Seeding database...');

  // Supprimer les lecons existantes pour eviter les doublons
  await prisma.lesson.deleteMany();

  const lessons = LESSONS.map((lesson) => ({
    level: lesson.level as never,
    theme: lesson.theme,
    order: lesson.order,
    is_premium: (lesson as { is_premium?: boolean }).is_premium ?? false,
    content_json: generateLessonContent(lesson.theme, lesson.level),
  }));

  await prisma.lesson.createMany({ data: lessons });

  console.log(`Seeded ${lessons.length} lessons.`);

  // Seed vocabulaire de base A1
  const A1_WORDS = [
    { word_en: 'hello', level: 'A1', translations_json: { fr: 'bonjour', es: 'hola', it: 'ciao', ar: 'مرحبا', pt: 'olá', de: 'hallo', en: 'hello' } },
    { word_en: 'goodbye', level: 'A1', translations_json: { fr: 'au revoir', es: 'adiós', it: 'arrivederci', ar: 'وداعا', pt: 'adeus', de: 'auf Wiedersehen', en: 'goodbye' } },
    { word_en: 'please', level: 'A1', translations_json: { fr: 's\'il vous plaît', es: 'por favor', it: 'per favore', ar: 'من فضلك', pt: 'por favor', de: 'bitte', en: 'please' } },
    { word_en: 'thank you', level: 'A1', translations_json: { fr: 'merci', es: 'gracias', it: 'grazie', ar: 'شكرا', pt: 'obrigado', de: 'danke', en: 'thank you' } },
    { word_en: 'yes', level: 'A1', translations_json: { fr: 'oui', es: 'sí', it: 'sì', ar: 'نعم', pt: 'sim', de: 'ja', en: 'yes' } },
    { word_en: 'no', level: 'A1', translations_json: { fr: 'non', es: 'no', it: 'no', ar: 'لا', pt: 'não', de: 'nein', en: 'no' } },
    { word_en: 'water', level: 'A1', translations_json: { fr: 'eau', es: 'agua', it: 'acqua', ar: 'ماء', pt: 'água', de: 'Wasser', en: 'water' } },
    { word_en: 'house', level: 'A1', translations_json: { fr: 'maison', es: 'casa', it: 'casa', ar: 'بيت', pt: 'casa', de: 'Haus', en: 'house' } },
    { word_en: 'friend', level: 'A1', translations_json: { fr: 'ami', es: 'amigo', it: 'amico', ar: 'صديق', pt: 'amigo', de: 'Freund', en: 'friend' } },
    { word_en: 'work', level: 'A1', translations_json: { fr: 'travail', es: 'trabajo', it: 'lavoro', ar: 'عمل', pt: 'trabalho', de: 'Arbeit', en: 'work' } },
  ];

  await prisma.vocabularyWord.deleteMany();
  await prisma.vocabularyWord.createMany({
    data: A1_WORDS.map((w) => ({ ...w, level: w.level as never })),
  });

  console.log(`Seeded ${A1_WORDS.length} vocabulary words.`);
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
