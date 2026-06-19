import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: vi.fn(),
            signToken: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
  });

  describe('POST /auth/login', () => {
    it('should return access_token on valid credentials', async () => {
      const mockUser = { id: 'u1', email: 'test@brila.com' };
      vi.spyOn(authService, 'validateUser').mockResolvedValue(mockUser as any);
      vi.spyOn(authService, 'signToken').mockReturnValue('jwt-123');

      const result = await controller.login({
        email: 'test@brila.com',
        password: 'Password1!',
      } as any);

      expect(result).toEqual({ access_token: 'jwt-123' });
      expect(authService.validateUser).toHaveBeenCalledWith('test@brila.com', 'Password1!');
      expect(authService.signToken).toHaveBeenCalledWith('u1', 'test@brila.com');
    });

    it('should propagate errors from validateUser', async () => {
      vi.spyOn(authService, 'validateUser').mockRejectedValue(new Error('Unauthorized'));

      await expect(
        controller.login({ email: 'bad@x.com', password: 'x' } as any),
      ).rejects.toThrow('Unauthorized');
    });
  });
});
