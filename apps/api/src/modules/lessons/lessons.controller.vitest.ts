import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

describe('LessonsController', () => {
  let controller: LessonsController;
  let service: LessonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [
        {
          provide: LessonsService,
          useValue: {
            findAll: vi.fn(),
            findById: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(LessonsController);
    service = module.get(LessonsService);
  });

  describe('GET /lessons', () => {
    it('should return lessons for non-premium user', async () => {
      const lessons = [{ id: '1' }];
      vi.spyOn(service, 'findAll').mockResolvedValue(lessons as any);

      const result = await controller.findAll({ user: undefined } as any);

      expect(result).toEqual(lessons);
      expect(service.findAll).toHaveBeenCalledWith(false);
    });

    it('should return all lessons for premium user', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue([]);

      await controller.findAll({ user: { isPremium: true } } as any);

      expect(service.findAll).toHaveBeenCalledWith(true);
    });
  });

  describe('GET /lessons/:id', () => {
    it('should return a single lesson', async () => {
      const lesson = { id: '1', title: 'test' };
      vi.spyOn(service, 'findById').mockResolvedValue(lesson as any);

      const result = await controller.findOne('1');

      expect(result).toEqual(lesson);
      expect(service.findById).toHaveBeenCalledWith('1');
    });
  });
});
