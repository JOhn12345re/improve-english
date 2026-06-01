import { Injectable } from '@nestjs/common';
import { IsIn, IsString, IsOptional } from 'class-validator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FsrsService } from './fsrs.service';

export class ReviewVocabularyDto {
  @IsString()
  word_id!: string;

  @IsString()
  @IsOptional()
  vocabularyId?: string; // alias sent by mobile

  @IsIn([1, 2, 3, 4])
  @IsOptional()
  rating?: 1 | 2 | 3 | 4;

  @IsIn([1, 2, 3, 4])
  @IsOptional()
  quality?: 1 | 2 | 3 | 4; // alias sent by mobile
}

@Injectable()
export class VocabularyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fsrs: FsrsService,
  ) {}

  async getDueWords(userId: string) {
    const records = await this.prisma.userVocabulary.findMany({
      where: {
        user_id: userId,
        next_review_at: { lte: new Date() },
      },
      include: { word: true },
      orderBy: { next_review_at: 'asc' },
      take: 20,
    });

    // Transform to mobile-friendly format
    return records.map((r) => {
      const translations = r.word.translations_json as Record<string, string> | null;
      return {
        id: r.word_id,
        word: r.word.word_en,
        translation: translations?.fr ?? translations?.en ?? '',
        level: r.word.level,
        partOfSpeech: (r.word as any).part_of_speech ?? '',
        masteryLevel: r.mastery_level,
        reps: r.reps,
      };
    });
  }

  async getStats(userId: string) {
    const total = await this.prisma.userVocabulary.count({ where: { user_id: userId } });
    const due = await this.prisma.userVocabulary.count({
      where: { user_id: userId, next_review_at: { lte: new Date() } },
    });
    const mastered = await this.prisma.userVocabulary.count({
      where: { user_id: userId, mastery_level: { gte: 0.8 } },
    });
    const avgMastery = await this.prisma.userVocabulary.aggregate({
      where: { user_id: userId },
      _avg: { mastery_level: true },
    });

    return {
      total,
      due,
      mastered,
      masteryPercent: Math.round((avgMastery._avg.mastery_level ?? 0) * 100),
    };
  }

  async reviewWord(userId: string, dto: ReviewVocabularyDto) {
    // Support both field name conventions (mobile sends vocabularyId/quality)
    const wordId = dto.word_id || dto.vocabularyId || '';
    const rating = dto.rating || dto.quality || 3;

    const record = await this.prisma.userVocabulary.findUnique({
      where: { user_id_word_id: { user_id: userId, word_id: wordId } },
    });

    const card = record ?? { stability: 1, difficulty: 5, reps: 0, lapses: 0 };
    const result = this.fsrs.schedule(card, rating);

    const updated = await this.prisma.userVocabulary.upsert({
      where: { user_id_word_id: { user_id: userId, word_id: wordId } },
      create: {
        user_id: userId,
        word_id: wordId,
        ...result,
        last_review_at: new Date(),
      },
      update: {
        ...result,
        last_review_at: new Date(),
      },
    });

    return { success: true, nextReview: updated.next_review_at, mastery: updated.mastery_level };
  }

  async addWordsFromLesson(userId: string, words: Array<{ word: string; translation: string; level: string }>) {
    let added = 0;
    for (const w of words) {
      // Find or create the vocabulary word
      let vocabWord = await this.prisma.vocabularyWord.findUnique({
        where: { word_en: w.word.toLowerCase().trim() },
      });

      if (!vocabWord) {
        vocabWord = await this.prisma.vocabularyWord.create({
          data: {
            word_en: w.word.toLowerCase().trim(),
            translations_json: { fr: w.translation },
            level: w.level as any,
          },
        });
      }

      // Check if user already has this word
      const exists = await this.prisma.userVocabulary.findUnique({
        where: { user_id_word_id: { user_id: userId, word_id: vocabWord.id } },
      });

      if (!exists) {
        await this.prisma.userVocabulary.create({
          data: {
            user_id: userId,
            word_id: vocabWord.id,
            stability: 1,
            difficulty: 5,
            reps: 0,
            lapses: 0,
            mastery_level: 0,
            next_review_at: new Date(), // due immediately for first review
            last_review_at: new Date(),
          },
        });
        added++;
      }
    }
    return { added };
  }
}
