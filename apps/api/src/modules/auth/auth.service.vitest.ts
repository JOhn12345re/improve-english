import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-1',
    email: 'test@brila.com',
    native_language: 'fr',
    level: 'A1',
    streak: 5,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: vi.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: vi.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    it('should return user when found by email', async () => {
      vi.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);

      const result = await authService.validateUser('test@brila.com', 'password');

      expect(result).toEqual(mockUser);
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@brila.com');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      vi.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(
        authService.validateUser('unknown@brila.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signToken', () => {
    it('should return a signed JWT token', () => {
      vi.spyOn(jwtService, 'sign').mockReturnValue('jwt-token-123');

      const token = authService.signToken('user-1', 'test@brila.com');

      expect(token).toBe('jwt-token-123');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'test@brila.com',
      });
    });

    it('should include sub and email in payload', () => {
      const signSpy = vi.spyOn(jwtService, 'sign').mockReturnValue('token');

      authService.signToken('user-42', 'john@example.com');

      expect(signSpy).toHaveBeenCalledWith({
        sub: 'user-42',
        email: 'john@example.com',
      });
    });
  });
});
