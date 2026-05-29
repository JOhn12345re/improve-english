import { LlmService } from '../../../integrations/llm/llm.service';
import { CefrLevel } from '@englishflow/shared-types';

export interface FillBlankItem {
  sentence: string;
  sentenceFr: string;
  answer: string;
  options: [string, string, string, string];
}

export interface FillBlankOutput {
  items: FillBlankItem[];
}

export async function generateFillBlank(
  llm: LlmService,
  passage: string,
  level: CefrLevel,
): Promise<FillBlankOutput | null> {
  const prompt = `
You are creating fill-in-the-blank vocabulary exercises for a French-speaking English learner at CEFR level ${level}.

Source passage:
"""
${passage.slice(0, 1500)}
"""

Generate exactly 4 fill-in-the-blank exercises using vocabulary from the passage.
Choose words appropriate for level ${level}.

Return ONLY valid JSON:
{
  "items": [
    {
      "sentence": "English sentence with ___ replacing the target word",
      "sentenceFr": "French translation of the sentence with ___ for the blank",
      "answer": "the correct word",
      "options": ["correct word", "wrong1", "wrong2", "wrong3"]
    }
  ]
}

Rules:
- The options array must be shuffled (correct answer NOT always first)
- Distractors must be plausible (same part of speech, similar length)
- Sentences must come directly from or be inspired by the passage
`.trim();

  try {
    const result = await llm.generate(prompt, {
      maxTokens: 600,
      temperature: 0.4,
      skipCache: false,
    });

    const json = extractJson(result.text);
    const parsed = JSON.parse(json) as FillBlankOutput;

    if (!Array.isArray(parsed.items) || parsed.items.length === 0) return null;
    for (const item of parsed.items) {
      if (!item.sentence || !item.answer || !Array.isArray(item.options) || item.options.length !== 4) return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function extractJson(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}
