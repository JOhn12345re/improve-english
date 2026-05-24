import { Injectable } from '@nestjs/common';
import { IsIn, IsString } from 'class-validator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FsrsService } from './fsrs.service';

export class ReviewVocabularyDto {
  @IsString()
  word_id!: string;

  @IsIn([1, 2, 3, 4])
  rating!: 1 | 2 | 3 | 4;
}

@Injectable()
export class VocabularyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fsrs: FsrsService,
  ) {}

  async getDueWords(userId: string) {
    return this.prisma.userVocabulary.findMany({
      where: {
        user_id: userId,
        next_review_at: { lte: new Date() },
      },
      include: { word: true },
      orderBy: { next_review_at: 'asc' },
      take: 20,
    });
  }

  async reviewWord(userId: string, dto: ReviewVocabularyDto) {
    const record = await this.prisma.userVocabulary.findUnique({
      where: { user_id_word_id: { user_id: userId, word_id: dto.word_id } },
    });

    const card = record ?? { stability: 1, difficulty: 5, reps: 0, lapses: 0 };
    const result = this.fsrs.schedule(card, dto.rating);

    return this.prisma.userVocabulary.upsert({
      where: { user_id_word_id: { user_id: userId, word_id: dto.word_id } },
      create: {
        user_id: userId,
        word_id: dto.word_id,
        ...result,
        last_review_at: new Date(),
      },
      update: {
        ...result,
        last_review_at: new Date(),
      },
    });
  }
}
