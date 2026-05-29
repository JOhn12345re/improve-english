import { Injectable } from '@nestjs/common';
import { LlmService } from '../integrations/llm/llm.service';
import { FeedbackDto, TranslationCheckDto } from './ai.dto';

@Injectable()
export class AiService {
  constructor(private readonly llm: LlmService) {}

  async getExerciseFeedback(dto: FeedbackDto): Promise<{ explanation: string }> {
    const prompt = `
A student learning English (level ${dto.level}) answered an exercise incorrectly.

Exercise type: ${dto.exerciseType}
Question: "${dto.question}"
Correct answer: "${dto.correctAnswer}"
Student's answer: "${dto.userAnswer}"

In 2-3 short sentences in French, explain why their answer is wrong and give a clear tip to remember the correct answer.
Be encouraging and pedagogical. Do not repeat the question. Just give the explanation.
`.trim();

    const result = await this.llm.generate(prompt, {
      maxTokens: 150,
      temperature: 0.5,
      systemPrompt: 'You are a friendly English teacher. Always respond in French.',
    });

    return { explanation: result.text };
  }

  async checkTranslation(
    dto: TranslationCheckDto,
  ): Promise<{ correct: boolean; explanation: string }> {
    const prompt = `
A student (level ${dto.level}) translated this French sentence into English.

French: "${dto.sourceFr}"
Expected English: "${dto.correctEn}"
Student's answer: "${dto.userAnswer}"

First line: reply with only "CORRECT" or "WRONG" based on whether the meaning and grammar are essentially right (minor spelling/punctuation differences are OK).
Second line onwards: in 1-2 sentences in French, briefly explain your decision.
`.trim();

    const result = await this.llm.generate(prompt, {
      maxTokens: 120,
      temperature: 0.2,
      skipCache: true,
    });

    const lines = result.text.split('\n').map((l) => l.trim()).filter(Boolean);
    const verdict = lines[0]?.toUpperCase().includes('CORRECT');
    const explanation = lines.slice(1).join(' ') || '';

    return { correct: verdict, explanation };
  }
}
