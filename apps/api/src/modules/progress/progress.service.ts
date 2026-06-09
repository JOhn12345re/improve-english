import { Injectable } from '@nestjs/common';
import { IsNumber, IsString, Max, Min } from 'class-validator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CefrLevel } from '@englishflow/shared-types';

export class RecordProgressDto {
  @IsString()
  lesson_id!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number;
}

const CONSECUTIVE_LESSONS_THRESHOLD = 3;
const LEVEL_UP_SCORE = 90;
const REVIEW_SCORE = 60;

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async recordProgress(userId: string, dto: RecordProgressDto) {
    const existing = await this.prisma.userProgress.findUnique({
      where: { user_id_lesson_id: { user_id: userId, lesson_id: dto.lesson_id } },
    });

    const progress = await this.prisma.userProgress.upsert({
      where: { user_id_lesson_id: { user_id: userId, lesson_id: dto.lesson_id } },
      create: {
        user_id: userId,
        lesson_id: dto.lesson_id,
        score: dto.score,
        attempts: 1,
      },
      update: {
        score: dto.score,
        attempts: { increment: 1 },
        completed_at: new Date(),
      },
    });

    // Mettre a jour le streak et XP utilisateur
    await this.updateStreakAndXp(userId, dto.score);

    // Verifier si suggestion de changement de niveau
    const suggestion = await this.checkLevelProgression(userId);

    return { progress, suggestion };
  }

  async getUserProgress(userId: string) {
    return this.prisma.userProgress.findMany({
      where: { user_id: userId },
      orderBy: { completed_at: 'desc' },
      take: 50,
    });
  }

  async getStreakInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, longest_streak: true, last_activity: true, xp: true },
    });
    if (!user) return null;

    const now = new Date();
    const lastActivity = user.last_activity;
    let isActiveToday = false;
    if (lastActivity) {
      const hoursSinceLast = (now.getTime() - lastActivity.getTime()) / 3_600_000;
      isActiveToday = hoursSinceLast < 20;
    }

    // Milestones
    const milestones = [3, 7, 14, 30, 60, 100, 200, 365];
    const nextMilestone = milestones.find((m) => m > user.streak) ?? null;

    return {
      current: user.streak,
      longest: user.longest_streak,
      isActiveToday,
      nextMilestone,
      xp: user.xp,
    };
  }

  private async updateStreakAndXp(userId: string, score: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const now = new Date();
    const lastActivity = user.last_activity;
    const xpGained = Math.round((score / 100) * 20); // max 20 XP par lecon

    let newStreak = user.streak;
    if (lastActivity) {
      const hoursSinceLast = (now.getTime() - lastActivity.getTime()) / 3_600_000;
      if (hoursSinceLast > 48) {
        newStreak = 1; // streak casse
      } else if (hoursSinceLast >= 20) {
        newStreak += 1; // nouvelle journee
      }
    } else {
      newStreak = 1;
    }

    const newLongest = Math.max(newStreak, user.longest_streak);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        longest_streak: newLongest,
        last_activity: now,
        xp: { increment: xpGained },
      },
    });
  }

  private async checkLevelProgression(userId: string): Promise<{
    type: 'level_up' | 'review' | null;
    suggested_level?: CefrLevel;
  }> {
    const recentProgress = await this.prisma.userProgress.findMany({
      where: { user_id: userId },
      orderBy: { completed_at: 'desc' },
      take: CONSECUTIVE_LESSONS_THRESHOLD,
    });

    if (recentProgress.length < CONSECUTIVE_LESSONS_THRESHOLD) return { type: null };

    const avgScore = recentProgress.reduce((s, p) => s + p.score, 0) / recentProgress.length;

    if (avgScore >= LEVEL_UP_SCORE) return { type: 'level_up' };
    if (avgScore < REVIEW_SCORE) return { type: 'review' };
    return { type: null };
  }
}
