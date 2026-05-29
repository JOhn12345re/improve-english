import { LlmService } from '../../../integrations/llm/llm.service';
import { CefrLevel } from '@englishflow/shared-types';

export interface RcQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface RcOutput {
  questions: RcQuestion[];
}

const QUESTIONS_BY_LEVEL: Record<string, number> = {
  A1: 3, A2: 4, B1: 5, B2: 5, C1: 5, C2: 5,
};

export async function generateReadingComprehension(
  llm: LlmService,
  passage: string,
  level: CefrLevel,
): Promise<RcOutput | null> {
  const n = QUESTIONS_BY_LEVEL[level] ?? 5;

  const prompt = `
You are creating a reading comprehension exercise for an English learner at CEFR level ${level}.

Source passage:
"""
${passage.slice(0, 2000)}
"""

Generate exactly ${n} comprehension questions about this passage.
Each question must have exactly 4 answer options (A, B, C, D) where only one is correct.

CONSTRAINTS:
- Questions must be answerable ONLY from the passage (no external knowledge required)
- Difficulty must match level ${level} (vocabulary in the question, not just in the passage)
- Distractor options must be plausible but clearly wrong
- Avoid "all of the above" or "none of the above"

Return ONLY valid JSON, no other text:
{
  "questions": [
    {
      "question": "...",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explanation": "Brief quote or reference from the passage that justifies the answer"
    }
  ]
}
`.trim();

  try {
    const result = await llm.generate(prompt, {
      maxTokens: 800,
      temperature: 0.3,
      skipCache: false,
    });

    const json = extractJson(result.text);
    const parsed = JSON.parse(json) as RcOutput;

    // Validate structure
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) return null;
    for (const q of parsed.questions) {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) return null;
      if (typeof q.correctIndex !== 'number') return null;
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
