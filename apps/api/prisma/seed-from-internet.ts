/**
 * Seed script: fetches real content from the internet and generates
 * structured lessons via Groq LLM API.
 *
 * Run on Railway (where GROQ_API_KEY is set):
 *   npx ts-node prisma/seed-from-internet.ts
 *
 * Or locally with:
 *   GROQ_API_KEY=gsk_xxx npx ts-node prisma/seed-from-internet.ts
 */
import { PrismaClient, CefrLevel, ContentSource, IngestionStatus } from '@prisma/client';

const prisma = new PrismaClient();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

// ── Sources: Simple Wikipedia articles (public domain) ─────────────────────

const WIKIPEDIA_TOPICS = [
  'Weather', 'Solar_System', 'Water', 'Music', 'Football',
  'Dog', 'Cat', 'Internet', 'Computer', 'Television',
  'Cooking', 'Travel', 'Health', 'Sport', 'School',
  'Family', 'City', 'Country', 'Ocean', 'Forest',
  'Pollution', 'Climate_change', 'Recycling', 'Volcano', 'Earthquake',
  'Democracy', 'Human_rights', 'United_Nations', 'Artificial_intelligence', 'Robotics',
];

// ── VOA RSS feeds ──────────────────────────────────────────────────────────

const VOA_FEEDS: Record<string, { url: string; level: CefrLevel }> = {
  beginning: {
    url: 'https://learningenglish.voanews.com/api/zmgqoe$voe',
    level: CefrLevel.A2,
  },
  intermediate: {
    url: 'https://learningenglish.voanews.com/api/zogqie$Ymp',
    level: CefrLevel.B1,
  },
};

// ── Groq API helper ────────────────────────────────────────────────────────

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callGroq(messages: GroqMessage[], maxTokens = 1500): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Groq HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json() as any;
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

function extractJson(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Fetch content from Wikipedia (full extracts) ───────────────────────────

async function fetchWikipediaArticle(title: string): Promise<{ text: string; url: string } | null> {
  try {
    // Use MediaWiki API with full extract (not just summary)
    const params = new URLSearchParams({
      action: 'query',
      titles: title,
      prop: 'extracts',
      exintro: '0',        // Get full article, not just intro
      explaintext: '1',    // Plain text, no HTML
      exsectionformat: 'plain',
      format: 'json',
    });
    const apiUrl = `https://simple.wikipedia.org/w/api.php?${params}`;
    const res = await fetch(apiUrl, {
      headers: { 'User-Agent': 'EnglishFlow-Bot/1.0 (educational app)' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;

    const data = await res.json() as any;
    const pages = data.query?.pages ?? {};
    const page = Object.values(pages)[0] as any;
    if (!page || page.missing !== undefined) return null;

    const text = (page.extract ?? '').trim();
    if (text.length < 200) return null;

    return {
      text: text.slice(0, 4000),
      url: `https://simple.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    };
  } catch {
    return null;
  }
}

// ── Generate content directly with Groq (for levels lacking content) ───────

interface GeneratedContent {
  title: string;
  text: string;
  level: CefrLevel;
  theme: string;
}

const CONTENT_PROMPTS: Array<{ theme: string; level: CefrLevel; topic: string }> = [
  { theme: 'daily-life', level: CefrLevel.A1, topic: 'A simple story about going to the supermarket' },
  { theme: 'hobbies', level: CefrLevel.A1, topic: 'A child talking about their favorite hobby' },
  { theme: 'family', level: CefrLevel.A2, topic: 'Describing a family gathering during a holiday' },
  { theme: 'travel', level: CefrLevel.A2, topic: 'A tourist asking for directions in a city' },
  { theme: 'jobs', level: CefrLevel.A2, topic: 'Different jobs and what people do at work' },
  { theme: 'social-media', level: CefrLevel.B1, topic: 'The effects of social media on teenagers' },
  { theme: 'sports', level: CefrLevel.B1, topic: 'The history and rules of a popular sport' },
  { theme: 'culture', level: CefrLevel.B1, topic: 'Cultural differences between countries' },
  { theme: 'science', level: CefrLevel.B2, topic: 'How vaccines work and their importance in public health' },
  { theme: 'society', level: CefrLevel.B2, topic: 'The impact of remote work on urban planning' },
  { theme: 'philosophy', level: CefrLevel.C1, topic: 'The ethics of artificial intelligence in healthcare decisions' },
  { theme: 'economics', level: CefrLevel.C1, topic: 'The debate between universal basic income supporters and critics' },
];

async function generateContentFromGroq(prompt: { theme: string; level: CefrLevel; topic: string }): Promise<GeneratedContent | null> {
  const levelDescriptions: Record<string, string> = {
    A1: 'very simple vocabulary, short sentences (5-8 words), present tense only, basic topics',
    A2: 'simple vocabulary, short sentences (8-12 words), present and past tense, everyday topics',
    B1: 'intermediate vocabulary, moderate sentences (12-18 words), various tenses, general topics',
    B2: 'upper-intermediate vocabulary, complex sentences (15-25 words), all tenses, abstract topics',
    C1: 'advanced vocabulary, sophisticated sentences (20-30 words), nuanced grammar, academic topics',
    C2: 'near-native vocabulary, complex academic prose, specialized terminology, philosophical/scientific topics',
  };

  const contentPrompt = `
Write a short English text (200-350 words) at CEFR level ${prompt.level} about: ${prompt.topic}

Language requirements for ${prompt.level}: ${levelDescriptions[prompt.level]}

The text should be:
- Educational and informative
- Natural-sounding English
- Appropriate for French-speaking learners at this level
- About a real-world topic that is interesting and useful

Return ONLY the text, no title or metadata.
`.trim();

  try {
    const text = await callGroq([
      { role: 'system', content: 'You are a professional English content writer creating educational material for language learners.' },
      { role: 'user', content: contentPrompt },
    ], 600);

    if (!text || text.length < 150) return null;

    return {
      title: prompt.topic,
      text,
      level: prompt.level,
      theme: prompt.theme,
    };
  } catch (err) {
    console.warn(`  Failed to generate content: ${(err as Error).message}`);
    return null;
  }
}

// ── Fetch VOA articles from RSS ────────────────────────────────────────────

async function fetchVoaArticles(feedUrl: string, max = 5): Promise<Array<{ title: string; text: string; url: string }>> {
  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'EnglishFlow-Bot/1.0' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const items: Array<{ title: string; text: string; url: string }> = [];

    // Simple XML parsing for RSS items
    const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
    for (const item of itemMatches.slice(0, max)) {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        ?? item.match(/<title>(.*?)<\/title>/)?.[1]
        ?? 'Untitled';
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] ?? '';
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
        ?? item.match(/<description>(.*?)<\/description>/)?.[1]
        ?? '';
      const content = item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1] ?? '';

      const text = (content || description)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();

      if (text.length > 100 && link) {
        items.push({ title, text: text.slice(0, 3000), url: link });
      }
    }

    return items;
  } catch (err) {
    console.warn(`Failed to fetch VOA: ${(err as Error).message}`);
    return [];
  }
}

// ── Detect CEFR level from text characteristics ───────────────────────────

function detectLevel(text: string): CefrLevel {
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentLen = sentences.length > 0 ? words.length / sentences.length : words.length;
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const diversity = uniqueWords.size / words.length;

  if (avgSentLen <= 8 && diversity <= 0.5) return CefrLevel.A1;
  if (avgSentLen <= 12 && diversity <= 0.55) return CefrLevel.A2;
  if (avgSentLen <= 16 && diversity <= 0.65) return CefrLevel.B1;
  if (avgSentLen <= 22) return CefrLevel.B2;
  if (avgSentLen <= 30) return CefrLevel.C1;
  return CefrLevel.C2;
}

// ── Generate a full lesson via Groq ────────────────────────────────────────

async function generateLesson(
  passage: string,
  level: CefrLevel,
  title: string,
  sourceUrl: string,
  sourceName: string,
): Promise<any | null> {
  const prompt = `
You are creating an English lesson for a French-speaking learner at CEFR level ${level}.

Source passage:
"""
${passage.slice(0, 2000)}
"""

Generate a complete lesson with EXACTLY 10 exercises. Include a mix of:
- 3 vocabulary MCQ (type: "mcq")
- 3 fill-in-the-blank (type: "fill")
- 2 reading comprehension MCQ (type: "mcq" with a "passage" field)
- 2 French→English translation (type: "translation")

Return ONLY valid JSON:
{
  "titleEn": "Short lesson title in English (max 8 words)",
  "titleFr": "French translation of the title",
  "descriptionEn": "One sentence describing what the learner will practice",
  "descriptionFr": "French translation",
  "exercises": [
    {
      "type": "mcq",
      "question": "What does '...' mean?",
      "questionFr": "Que signifie '...' ?",
      "options": ["correct answer", "wrong 1", "wrong 2", "wrong 3"],
      "correctIndex": 0,
      "explanation": "Brief explanation",
      "explanationFr": "Explication en francais"
    },
    {
      "type": "fill",
      "sentence": "The ___ is very important.",
      "sentenceFr": "Le ___ est tres important.",
      "answer": "correct word",
      "options": ["correct word", "wrong1", "wrong2", "wrong3"]
    },
    {
      "type": "mcq",
      "question": "According to the text, what...?",
      "questionFr": "Selon le texte, que...?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "...",
      "explanationFr": "...",
      "passage": "Short excerpt from the passage (max 200 chars)"
    },
    {
      "type": "translation",
      "instructionEn": "Translate into English.",
      "instructionFr": "Traduisez en anglais.",
      "sourceFr": "French sentence",
      "targetEn": "English translation"
    }
  ]
}

IMPORTANT:
- Shuffle correctIndex (don't always put correct answer first)
- Match difficulty to ${level}
- All French text must be natural French
- Return ONLY the JSON object, no markdown
`.trim();

  try {
    const raw = await callGroq([
      { role: 'system', content: 'You are an expert English teacher creating exercises for French-speaking learners. Always return valid JSON only.' },
      { role: 'user', content: prompt },
    ], 2000);

    const json = extractJson(raw);
    const parsed = JSON.parse(json);

    if (!parsed.exercises || !Array.isArray(parsed.exercises) || parsed.exercises.length < 3) {
      console.warn(`  Too few exercises generated for "${title}"`);
      return null;
    }

    return {
      title: { en: parsed.titleEn || title, fr: parsed.titleFr || title },
      description: {
        en: parsed.descriptionEn || 'Practice English with real-world content.',
        fr: parsed.descriptionFr || "Pratiquez l'anglais avec du contenu authentique.",
      },
      source: { url: sourceUrl, name: sourceName },
      exercises: parsed.exercises,
    };
  } catch (err) {
    console.error(`  Groq error for "${title}": ${(err as Error).message}`);
    return null;
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set. Set it as an environment variable.');
    process.exit(1);
  }

  console.log('=== Seed from Internet ===');
  console.log(`Using Groq model: ${GROQ_MODEL}`);

  let totalCreated = 0;

  // ── 1. Wikipedia Simple English articles ─────────────────────────────────
  console.log('\n--- Fetching Simple Wikipedia articles ---');
  for (const topic of WIKIPEDIA_TOPICS) {
    try {
      console.log(`Fetching: ${topic}...`);
      const article = await fetchWikipediaArticle(topic);
      if (!article) {
        console.log(`  Skipped (no content)`);
        continue;
      }

      const wordCount = article.text.split(/\s+/).length;
      if (wordCount < 100) {
        console.log(`  Skipped (too short: ${wordCount} words)`);
        continue;
      }

      // Check if already exists
      const exists = await prisma.rawContent.findUnique({
        where: { source_url: article.url },
      });
      if (exists) {
        console.log(`  Already ingested, skipping`);
        continue;
      }

      const level = detectLevel(article.text);
      console.log(`  ${wordCount} words, detected level: ${level}`);

      // Save RawContent
      const raw = await prisma.rawContent.create({
        data: {
          source: ContentSource.WIKIPEDIA_SIMPLE,
          source_url: article.url,
          source_meta: { topic, fetchedAt: new Date().toISOString() },
          title: topic.replace(/_/g, ' '),
          text: article.text,
          word_count: wordCount,
          detected_level: level,
          topics: [topic.toLowerCase().replace(/_/g, ' ')],
          status: IngestionStatus.CLASSIFIED,
          processed_at: new Date(),
        },
      });

      // Generate lesson via Groq
      console.log(`  Generating lesson via Groq...`);
      const lesson = await generateLesson(
        article.text,
        level,
        topic.replace(/_/g, ' '),
        article.url,
        'Simple Wikipedia',
      );

      if (lesson) {
        const maxOrder = await prisma.lesson.aggregate({
          where: { level },
          _max: { order: true },
        });
        const order = (maxOrder._max.order ?? 0) + 1;

        await prisma.lesson.create({
          data: {
            level,
            theme: topic.toLowerCase().replace(/_/g, '-'),
            order,
            is_premium: false,
            raw_content_id: raw.id,
            content_json: lesson,
          },
        });

        totalCreated++;
        console.log(`  Lesson created! (order: ${order})`);
      }

      // Rate limit: wait between Groq calls
      await sleep(2000);
    } catch (err) {
      console.error(`  Error on ${topic}: ${(err as Error).message}`);
    }
  }

  // ── 2. VOA Learning English RSS ──────────────────────────────────────────
  console.log('\n--- Fetching VOA Learning English articles ---');
  for (const [feedName, feed] of Object.entries(VOA_FEEDS)) {
    console.log(`\nFeed: ${feedName} (${feed.level})`);

    const articles = await fetchVoaArticles(feed.url, 10);
    console.log(`  Found ${articles.length} articles`);

    for (const article of articles) {
      try {
        // Check if already exists
        const exists = await prisma.rawContent.findUnique({
          where: { source_url: article.url },
        });
        if (exists) {
          console.log(`  [skip] ${article.title}`);
          continue;
        }

        const wordCount = article.text.split(/\s+/).length;
        if (wordCount < 80) {
          console.log(`  [short] ${article.title} (${wordCount} words)`);
          continue;
        }

        const source = feedName === 'beginning'
          ? ContentSource.VOA_BEGINNING
          : ContentSource.VOA_INTERMEDIATE;

        // Save RawContent
        const raw = await prisma.rawContent.create({
          data: {
            source,
            source_url: article.url,
            source_meta: { feed: feedName, fetchedAt: new Date().toISOString() },
            title: article.title,
            text: article.text,
            word_count: wordCount,
            detected_level: feed.level,
            topics: [],
            status: IngestionStatus.CLASSIFIED,
            processed_at: new Date(),
          },
        });

        console.log(`  Generating: ${article.title}...`);
        const lesson = await generateLesson(
          article.text,
          feed.level,
          article.title,
          article.url,
          'VOA Learning English',
        );

        if (lesson) {
          const maxOrder = await prisma.lesson.aggregate({
            where: { level: feed.level },
            _max: { order: true },
          });
          const order = (maxOrder._max.order ?? 0) + 1;

          await prisma.lesson.create({
            data: {
              level: feed.level,
              theme: 'voa-news',
              order,
              is_premium: false,
              raw_content_id: raw.id,
              content_json: lesson,
            },
          });

          totalCreated++;
          console.log(`  Lesson created! (order: ${order})`);
        }

        await sleep(2000);
      } catch (err) {
        console.error(`  Error: ${(err as Error).message}`);
      }
    }
  }

  // ── 3. Groq-generated content for under-represented levels ────────────────
  console.log('\n--- Generating original content via Groq ---');
  for (const contentPrompt of CONTENT_PROMPTS) {
    try {
      const sourceUrl = `groq://generated/${contentPrompt.theme}-${contentPrompt.level}-${Date.now()}`;

      console.log(`Generating ${contentPrompt.level} content: ${contentPrompt.topic}...`);
      const content = await generateContentFromGroq(contentPrompt);
      if (!content) {
        console.log(`  Skipped (generation failed)`);
        continue;
      }

      const wordCount = content.text.split(/\s+/).length;
      console.log(`  ${wordCount} words generated`);

      // Save RawContent
      const raw = await prisma.rawContent.create({
        data: {
          source: ContentSource.MANUAL_UPLOAD,
          source_url: sourceUrl,
          source_meta: { generatedBy: 'groq', topic: contentPrompt.topic, theme: contentPrompt.theme },
          title: content.title,
          text: content.text,
          word_count: wordCount,
          detected_level: content.level,
          topics: [contentPrompt.theme],
          status: IngestionStatus.CLASSIFIED,
          processed_at: new Date(),
        },
      });

      // Generate lesson exercises
      console.log(`  Generating exercises...`);
      const lesson = await generateLesson(
        content.text,
        content.level,
        content.title,
        sourceUrl,
        'Groq Generated',
      );

      if (lesson) {
        const maxOrder = await prisma.lesson.aggregate({
          where: { level: content.level },
          _max: { order: true },
        });
        const order = (maxOrder._max.order ?? 0) + 1;

        await prisma.lesson.create({
          data: {
            level: content.level,
            theme: contentPrompt.theme,
            order,
            is_premium: false,
            raw_content_id: raw.id,
            content_json: lesson,
          },
        });

        totalCreated++;
        console.log(`  Lesson created! (${content.level} #${order})`);
      }

      await sleep(3000); // Rate limit
    } catch (err) {
      console.error(`  Error: ${(err as Error).message}`);
    }
  }

  console.log(`\n=== Done! Created ${totalCreated} lessons ===`);

  // Print summary
  const stats = await prisma.lesson.groupBy({
    by: ['level'],
    _count: true,
  });
  console.log('\nTotal lessons by level:');
  for (const s of stats.sort((a, b) => a.level.localeCompare(b.level))) {
    console.log(`  ${s.level}: ${s._count} lessons`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
