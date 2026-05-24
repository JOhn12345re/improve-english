import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CefrLevel, LearningGoal, NativeLanguage } from '@englishflow/shared-types';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateProfileDto {
  @IsEnum(NativeLanguage)
  native_language!: NativeLanguage;

  @IsEnum(CefrLevel)
  level!: CefrLevel;

  @IsEnum(LearningGoal)
  learning_goal!: LearningGoal;

  @IsInt()
  @Min(5)
  @Max(30)
  daily_goal!: number;

  @IsOptional()
  @IsString()
  timezone?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email, deleted_at: null } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id, deleted_at: null } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createProfile(userId: string, email: string, dto: CreateProfileDto) {
    return this.prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email,
        native_language: dto.native_language as never,
        level: dto.level as never,
        learning_goal: dto.learning_goal as never,
        daily_goal: dto.daily_goal,
        timezone: dto.timezone ?? 'Europe/Paris',
        subscription: {
          create: {
            plan: 'free',
            status: 'active',
          },
        },
      },
      update: {
        native_language: dto.native_language as never,
        level: dto.level as never,
        learning_goal: dto.learning_goal as never,
        daily_goal: dto.daily_goal,
        timezone: dto.timezone ?? 'Europe/Paris',
      },
    });
  }

  async exportData(userId: string) {
    const user = await this.findById(userId);
    const progress = await this.prisma.userProgress.findMany({ where: { user_id: userId } });
    const vocabulary = await this.prisma.userVocabulary.findMany({ where: { user_id: userId } });
    const subscription = await this.prisma.subscription.findUnique({ where: { user_id: userId } });
    return { user, progress, vocabulary, subscription };
  }

  async requestDeletion(userId: string) {
    // RGPD: suppression apres 14 jours
    const deleteAt = new Date();
    deleteAt.setDate(deleteAt.getDate() + 14);
    return this.prisma.user.update({
      where: { id: userId },
      data: { deleted_at: deleteAt },
    });
  }
}
