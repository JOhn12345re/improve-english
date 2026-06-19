import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockReq = { user: { id: 'u1', email: 'test@brila.com' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findById: vi.fn(),
            createProfile: vi.fn(),
            exportData: vi.fn(),
            requestDeletion: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(UsersController);
    usersService = module.get(UsersService);
  });

  describe('GET /users/me', () => {
    it('should return the current user', async () => {
      const user = { id: 'u1', email: 'test@brila.com' };
      vi.spyOn(usersService, 'findById').mockResolvedValue(user as any);

      const result = await controller.getMe(mockReq);

      expect(result).toEqual(user);
      expect(usersService.findById).toHaveBeenCalledWith('u1');
    });
  });

  describe('POST /users/profile', () => {
    it('should create a profile', async () => {
      const dto = { native_language: 'fr', level: 'A1', learning_goal: 'travel', daily_goal: 10 };
      vi.spyOn(usersService, 'createProfile').mockResolvedValue({ id: 'u1' } as any);

      const result = await controller.createProfile(mockReq, dto as any);

      expect(result).toEqual({ id: 'u1' });
      expect(usersService.createProfile).toHaveBeenCalledWith('u1', 'test@brila.com', dto);
    });
  });

  describe('GET /users/me/export', () => {
    it('should return exported user data (RGPD)', async () => {
      const data = { user: {}, progress: [], vocabulary: [], subscription: null };
      vi.spyOn(usersService, 'exportData').mockResolvedValue(data as any);

      const result = await controller.exportData(mockReq);

      expect(result).toEqual(data);
    });
  });

  describe('DELETE /users/me', () => {
    it('should request deletion (RGPD)', async () => {
      vi.spyOn(usersService, 'requestDeletion').mockResolvedValue({} as any);

      await controller.deleteAccount(mockReq);

      expect(usersService.requestDeletion).toHaveBeenCalledWith('u1');
    });
  });
});
