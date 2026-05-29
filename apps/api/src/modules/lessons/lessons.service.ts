import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CefrLevel } from '@englishflow/shared-types';

const LEVEL_ORDER: CefrLevel[] = [
  CefrLevel.A1, CefrLevel.A2, CefrLevel.B1,
  CefrLevel.B2, CefrLevel.C1, CefrLevel.C2,
];

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Filtre les lecons selon le niveau utilisateur.
   * OBLIGATOIRE cote backend — jamais se fier uniquement au client.
   */
  async findByLevel(userLevel: CefrLevel, isPremium: boolean) {
    const allowedLevels = LEVEL_ORDER.slice(0, LEVEL_ORDER.indexOf(userLevel) + 1);

    return this.prisma.lesson.findMany({
      where: {
        level: { in: allowedLevels as never[] },
        ...(isPremium ? {} : { is_premium: false }),
      },
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
    });
  }

  async findById(id: string, userLevel: CefrLevel) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const lessonLevelIndex = LEVEL_ORDER.indexOf(lesson.level as CefrLevel);
    const userLevelIndex = LEVEL_ORDER.indexOf(userLevel);

    if (lessonLevelIndex > userLevelIndex) {
      throw new NotFoundException('Lesson not available for your level');
    }

    return lesson;
  }
}
