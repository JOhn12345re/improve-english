import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LessonsService } from './lessons.service';
import { PrismaService } from '../../common/prisma/prisma.service';

const prismaMock = {
  lesson: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
};

describe('LessonsService', () => {
  let service: LessonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(LessonsService);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all lessons for premium users', async () => {
      const lessons = [{ id: '1' }, { id: '2' }];
      prismaMock.lesson.findMany.mockResolvedValue(lessons);

      const result = await service.findAll(true);

      expect(result).toEqual(lessons);
      expect(prismaMock.lesson.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ level: 'asc' }, { order: 'asc' }],
      });
    });

    it('should filter premium lessons for free users', async () => {
      prismaMock.lesson.findMany.mockResolvedValue([]);

      await service.findAll(false);

      expect(prismaMock.lesson.findMany).toHaveBeenCalledWith({
        where: { is_premium: false },
        orderBy: [{ level: 'asc' }, { order: 'asc' }],
      });
    });
  });

  describe('findById', () => {
    it('should return a lesson by id', async () => {
      const lesson = { id: '1', title: 'Ma routine' };
      prismaMock.lesson.findUnique.mockResolvedValue(lesson);

      const result = await service.findById('1');

      expect(result).toEqual(lesson);
    });

    it('should throw NotFoundException when lesson not found', async () => {
      prismaMock.lesson.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
