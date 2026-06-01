import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(isPremium: boolean) {
    return this.prisma.lesson.findMany({
      where: isPremium ? {} : { is_premium: false },
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
    });
  }

  async findById(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }
}
