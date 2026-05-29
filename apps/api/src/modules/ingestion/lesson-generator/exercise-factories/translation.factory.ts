import { LlmService } from '../../../integrations/llm/llm.service';
import { CefrLevel } from '@englishflow/shared-types';

export interface TranslationItem {
  instructionFr: string;
  sourceFr: string;
  targetEn: string;
  hint?: string;
}

export interface TranslationOutput {
  items: TranslationItem[];
}

export async function generateTranslation(
  llm: LlmService,
  passage: string,
  level: CefrLevel,
): Promise<TranslationOutput | null> {
  const prompt = `
You are creating French→English translation exercises for a French-speaking learner at CEFR level ${level}.

Source passage (English):
"""
${passage.slice(0, 1200)}
"""

Generate 3 French→English translation exercises inspired by the passage.
Difficulty must match level ${level}.

Return ONLY valid JSON:
{
  "items": [
    {
      "instructionFr": "Traduisez cette phrase en anglais.",
      "sourceFr": "French sentence to translate",
      "targetEn": "Expected English translation",
      "hint": "optional short hint for A1/A2 levels, omit for B2+ levels"
    }
  ]
}

Rules:
- Sentences must be natural and useful in everyday communication
- For A1/A2: include a hint (first word or key phrase)
- For B1+: omit hint
- targetEn must be the natural English equivalent (not word-for-word)
`.trim();

  try {
    const result = await llm.generate(prompt, {
      maxTokens: 500,
      temperature: 0.5,
      skipCache: false,
    });

    const json = extractJson(result.text);
    const parsed = JSON.parse(json) as TranslationOutput;

    if (!Array.isArray(parsed.items) || parsed.items.length === 0) return null;
    for (const item of parsed.items) {
      if (!item.sourceFr || !item.targetEn) return null;
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
