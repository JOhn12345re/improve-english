import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

describe('ProgressController', () => {
  let controller: ProgressController;
  let service: ProgressService;

  const mockReq = { user: { id: 'u1' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [
        {
          provide: ProgressService,
          useValue: {
            recordProgress: vi.fn(),
            getUserProgress: vi.fn(),
            getStreakInfo: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(ProgressController);
    service = module.get(ProgressService);
  });

  describe('POST /progress', () => {
    it('should record progress for the user', async () => {
      const dto = { lesson_id: 'l1', score: 85 };
      const result = { progress: { score: 85 }, suggestion: { type: null } };
      vi.spyOn(service, 'recordProgress').mockResolvedValue(result as any);

      const response = await controller.record(mockReq, dto as any);

      expect(response).toEqual(result);
      expect(service.recordProgress).toHaveBeenCalledWith('u1', dto);
    });
  });

  describe('GET /progress', () => {
    it('should return user progress history', async () => {
      const entries = [{ lesson_id: 'l1', score: 85 }];
      vi.spyOn(service, 'getUserProgress').mockResolvedValue(entries as any);

      const result = await controller.getProgress(mockReq);

      expect(result).toEqual(entries);
    });
  });

  describe('GET /progress/streak', () => {
    it('should return streak info', async () => {
      const info = { current: 5, longest: 10, isActiveToday: true, nextMilestone: 7, xp: 200 };
      vi.spyOn(service, 'getStreakInfo').mockResolvedValue(info);

      const result = await controller.getStreak(mockReq);

      expect(result).toEqual(info);
    });
  });
});
