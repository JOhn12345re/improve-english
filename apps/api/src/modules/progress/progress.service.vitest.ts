import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProgressService } from './progress.service';
import { PrismaService } from '../../common/prisma/prisma.service';

const prismaMock = {
  userProgress: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

describe('ProgressService', () => {
  let service: ProgressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(ProgressService);
    vi.clearAllMocks();
  });

  // ── recordProgress ──────────────────────────────────────────────────────

  describe('recordProgress', () => {
    it('should upsert progress and return result with suggestion', async () => {
      prismaMock.userProgress.findUnique.mockResolvedValue(null);
      prismaMock.userProgress.upsert.mockResolvedValue({
        user_id: 'u1',
        lesson_id: 'l1',
        score: 85,
        attempts: 1,
      });
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u1',
        streak: 3,
        longest_streak: 5,
        last_activity: new Date(Date.now() - 25 * 3600 * 1000), // 25h ago
        xp: 100,
      });
      prismaMock.user.update.mockResolvedValue({});
      prismaMock.userProgress.findMany.mockResolvedValue([]);

      const result = await service.recordProgress('u1', {
        lesson_id: 'l1',
        score: 85,
      });

      expect(result.progress).toBeDefined();
      expect(result.suggestion).toBeDefined();
    });

    it('should increment attempts on re-submission', async () => {
      prismaMock.userProgress.findUnique.mockResolvedValue({ attempts: 2 });
      prismaMock.userProgress.upsert.mockResolvedValue({ attempts: 3 });
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u1', streak: 1, longest_streak: 1, last_activity: new Date(), xp: 0,
      });
      prismaMock.user.update.mockResolvedValue({});
      prismaMock.userProgress.findMany.mockResolvedValue([]);

      await service.recordProgress('u1', { lesson_id: 'l1', score: 90 });

      expect(prismaMock.userProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            attempts: { increment: 1 },
          }),
        }),
      );
    });
  });

  // ── getStreakInfo ────────────────────────────────────────────────────────

  describe('getStreakInfo', () => {
    it('should return streak info with milestones', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        streak: 5,
        longest_streak: 10,
        last_activity: new Date(), // active today
        xp: 200,
      });

      const result = await service.getStreakInfo('u1');

      expect(result).toEqual({
        current: 5,
        longest: 10,
        isActiveToday: true,
        nextMilestone: 7,
        xp: 200,
      });
    });

    it('should return null when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await service.getStreakInfo('missing');

      expect(result).toBeNull();
    });

    it('should mark isActiveToday=false when last activity > 20 hours', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        streak: 3,
        longest_streak: 3,
        last_activity: new Date(Date.now() - 21 * 3600 * 1000),
        xp: 50,
      });

      const result = await service.getStreakInfo('u1');

      expect(result!.isActiveToday).toBe(false);
    });

    it('should find next milestone correctly', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        streak: 8,
        longest_streak: 8,
        last_activity: new Date(),
        xp: 100,
      });

      const result = await service.getStreakInfo('u1');

      expect(result!.nextMilestone).toBe(14); // next after 7
    });

    it('should return null nextMilestone when past all milestones', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        streak: 400,
        longest_streak: 400,
        last_activity: new Date(),
        xp: 5000,
      });

      const result = await service.getStreakInfo('u1');

      expect(result!.nextMilestone).toBeNull();
    });
  });

  // ── getUserProgress ─────────────────────────────────────────────────────

  describe('getUserProgress', () => {
    it('should return latest 50 progress entries', async () => {
      const entries = Array(50).fill(null).map((_, i) => ({ lesson_id: `l${i}` }));
      prismaMock.userProgress.findMany.mockResolvedValue(entries);

      const result = await service.getUserProgress('u1');

      expect(result).toHaveLength(50);
      expect(prismaMock.userProgress.findMany).toHaveBeenCalledWith({
        where: { user_id: 'u1' },
        orderBy: { completed_at: 'desc' },
        take: 50,
      });
    });
  });
});
