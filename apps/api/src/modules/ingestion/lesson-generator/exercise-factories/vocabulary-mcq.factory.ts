import { LlmService } from '../../../integrations/llm/llm.service';
import { CefrLevel } from '@englishflow/shared-types';

export interface VocabMcqItem {
  word: string;
  question: string;
  questionFr: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanationFr: string;
}

export interface VocabMcqOutput {
  items: VocabMcqItem[];
}

export async function generateVocabularyMcq(
  llm: LlmService,
  passage: string,
  level: CefrLevel,
): Promise<VocabMcqOutput | null> {
  const prompt = `
You are creating vocabulary multiple-choice exercises for a French-speaking English learner at CEFR level ${level}.

Source passage:
"""
${passage.slice(0, 1500)}
"""

Identify 4 useful vocabulary words from the passage that are appropriate for level ${level}.
For each word, create a definition-choice question.

Return ONLY valid JSON:
{
  "items": [
    {
      "word": "the target vocabulary word",
      "question": "What does the word '...' mean in this context?",
      "questionFr": "French version of the question",
      "options": ["correct definition", "wrong def 1", "wrong def 2", "wrong def 3"],
      "correctIndex": 0,
      "explanationFr": "Brief explanation in French of why this word means this"
    }
  ]
}

Rules:
- Options must be shuffled (correct not always first)
- All options must be plausible definitions
- Explanations must be in French, encouraging and clear
`.trim();

  try {
    const result = await llm.generate(prompt, {
      maxTokens: 700,
      temperature: 0.4,
      skipCache: false,
    });

    const json = extractJson(result.text);
    const parsed = JSON.parse(json) as VocabMcqOutput;

    if (!Array.isArray(parsed.items) || parsed.items.length === 0) return null;
    for (const item of parsed.items) {
      if (!item.word || !item.question || !Array.isArray(item.options) || item.options.length !== 4) return null;
      if (typeof item.correctIndex !== 'number') return null;
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
