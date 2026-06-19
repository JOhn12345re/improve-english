import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersService, CreateProfileDto } from './users.service';
import { PrismaService } from '../../common/prisma/prisma.service';

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
  },
  userProgress: { findMany: vi.fn() },
  userVocabulary: { findMany: vi.fn() },
  subscription: { findUnique: vi.fn() },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(UsersService);
    vi.clearAllMocks();
  });

  // ── findByEmail ─────────────────────────────────────────────────────────

  describe('findByEmail', () => {
    it('should query by email with deleted_at null', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: '1', email: 'a@b.com' });

      const result = await service.findByEmail('a@b.com');

      expect(result).toEqual({ id: '1', email: 'a@b.com' });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'a@b.com', deleted_at: null },
      });
    });

    it('should return null when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nobody@x.com');

      expect(result).toBeNull();
    });
  });

  // ── findById ────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should return user by id', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: '1' });

      const result = await service.findById('1');

      expect(result).toEqual({ id: '1' });
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ── createProfile ───────────────────────────────────────────────────────

  describe('createProfile', () => {
    const dto: CreateProfileDto = {
      native_language: 'fr' as any,
      level: 'A1' as any,
      learning_goal: 'travel' as any,
      daily_goal: 10,
      timezone: 'Europe/Paris',
    };

    it('should upsert user profile', async () => {
      const mockResult = { id: 'u1', email: 'a@b.com', ...dto };
      prismaMock.user.upsert.mockResolvedValue(mockResult);

      const result = await service.createProfile('u1', 'a@b.com', dto);

      expect(result).toEqual(mockResult);
      expect(prismaMock.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          create: expect.objectContaining({
            id: 'u1',
            email: 'a@b.com',
            daily_goal: 10,
          }),
          update: expect.objectContaining({
            daily_goal: 10,
          }),
        }),
      );
    });

    it('should default timezone to Europe/Paris', async () => {
      const dtoNoTz = { ...dto, timezone: undefined };
      prismaMock.user.upsert.mockResolvedValue({});

      await service.createProfile('u1', 'a@b.com', dtoNoTz);

      const call = prismaMock.user.upsert.mock.calls[0][0];
      expect(call.create.timezone).toBe('Europe/Paris');
      expect(call.update.timezone).toBe('Europe/Paris');
    });

    it('should create a free subscription on first create', async () => {
      prismaMock.user.upsert.mockResolvedValue({});

      await service.createProfile('u1', 'a@b.com', dto);

      const call = prismaMock.user.upsert.mock.calls[0][0];
      expect(call.create.subscription).toEqual({
        create: { plan: 'free', status: 'active' },
      });
    });
  });

  // ── exportData (RGPD) ──────────────────────────────────────────────────

  describe('exportData', () => {
    it('should return user data, progress, vocabulary, and subscription', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' });
      prismaMock.userProgress.findMany.mockResolvedValue([{ lesson_id: 'l1' }]);
      prismaMock.userVocabulary.findMany.mockResolvedValue([{ word_id: 'w1' }]);
      prismaMock.subscription.findUnique.mockResolvedValue({ plan: 'free' });

      const result = await service.exportData('u1');

      expect(result.user).toEqual({ id: 'u1' });
      expect(result.progress).toEqual([{ lesson_id: 'l1' }]);
      expect(result.vocabulary).toEqual([{ word_id: 'w1' }]);
      expect(result.subscription).toEqual({ plan: 'free' });
    });

    it('should throw if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.exportData('missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ── requestDeletion (RGPD) ─────────────────────────────────────────────

  describe('requestDeletion', () => {
    it('should set deleted_at to 14 days from now', async () => {
      prismaMock.user.update.mockResolvedValue({});

      await service.requestDeletion('u1');

      const call = prismaMock.user.update.mock.calls[0][0];
      expect(call.where).toEqual({ id: 'u1' });

      const deletedAt = call.data.deleted_at as Date;
      const daysFromNow = (deletedAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      expect(daysFromNow).toBeGreaterThan(13);
      expect(daysFromNow).toBeLessThanOrEqual(14.1);
    });
  });
});
