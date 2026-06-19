import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as crypto from 'crypto';

const prismaMock = {
  subscription: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

const configMock = {
  getOrThrow: vi.fn(),
};

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get(SubscriptionsService);
    vi.clearAllMocks();
  });

  // ── getSubscription ─────────────────────────────────────────────────────

  describe('getSubscription', () => {
    it('should return subscription by user_id', async () => {
      const sub = { user_id: 'u1', plan: 'free', status: 'active' };
      prismaMock.subscription.findUnique.mockResolvedValue(sub);

      const result = await service.getSubscription('u1');

      expect(result).toEqual(sub);
      expect(prismaMock.subscription.findUnique).toHaveBeenCalledWith({
        where: { user_id: 'u1' },
      });
    });
  });

  // ── isPremium ───────────────────────────────────────────────────────────

  describe('isPremium', () => {
    it('should return false for free plan', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        plan: 'free',
        status: 'active',
        expires_at: null,
      });

      expect(await service.isPremium('u1')).toBe(false);
    });

    it('should return true for active premium plan', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        plan: 'premium_monthly',
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000), // 30 days future
      });

      expect(await service.isPremium('u1')).toBe(true);
    });

    it('should return false for expired premium', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        plan: 'premium_monthly',
        status: 'active',
        expires_at: new Date('2020-01-01'), // expired
      });

      expect(await service.isPremium('u1')).toBe(false);
    });

    it('should return false for cancelled status', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        plan: 'premium_monthly',
        status: 'expired',
        expires_at: null,
      });

      expect(await service.isPremium('u1')).toBe(false);
    });

    it('should return false when no subscription exists', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(null);

      expect(await service.isPremium('u1')).toBe(false);
    });

    it('should return true for trial status with premium plan', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        plan: 'premium_monthly',
        status: 'trial',
        expires_at: null,
      });

      expect(await service.isPremium('u1')).toBe(true);
    });
  });

  // ── handleRevenueCatWebhook ─────────────────────────────────────────────

  describe('handleRevenueCatWebhook', () => {
    function validSignature(): string {
      const secret = 'test-secret';
      configMock.getOrThrow.mockReturnValue(secret);
      return crypto.createHmac('sha256', secret).digest('hex');
    }

    it('should activate subscription on INITIAL_PURCHASE', async () => {
      const sig = validSignature();
      prismaMock.subscription.update.mockResolvedValue({});

      await service.handleRevenueCatWebhook(
        {
          event: {
            type: 'INITIAL_PURCHASE',
            app_user_id: 'u1',
            product_id: 'premium_monthly',
            expiration_at_ms: Date.now() + 30 * 24 * 3600 * 1000,
          },
        },
        sig,
      );

      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'u1' },
          data: expect.objectContaining({ status: 'active' }),
        }),
      );
    });

    it('should set status expired on CANCELLATION', async () => {
      const sig = validSignature();
      prismaMock.subscription.update.mockResolvedValue({});

      await service.handleRevenueCatWebhook(
        {
          event: {
            type: 'CANCELLATION',
            app_user_id: 'u1',
            product_id: 'premium_monthly',
          },
        },
        sig,
      );

      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'expired' },
        }),
      );
    });

    it('should set status trial on TRIAL_STARTED', async () => {
      const sig = validSignature();
      prismaMock.subscription.update.mockResolvedValue({});

      await service.handleRevenueCatWebhook(
        {
          event: {
            type: 'TRIAL_STARTED',
            app_user_id: 'u1',
            product_id: 'premium_monthly',
          },
        },
        sig,
      );

      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'trial' }),
        }),
      );
    });

    it('should throw UnauthorizedException on invalid signature', async () => {
      configMock.getOrThrow.mockReturnValue('real-secret');

      await expect(
        service.handleRevenueCatWebhook(
          {
            event: {
              type: 'INITIAL_PURCHASE',
              app_user_id: 'u1',
              product_id: 'premium_monthly',
            },
          },
          'bad-signature',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should map yearly product correctly', async () => {
      const sig = validSignature();
      prismaMock.subscription.update.mockResolvedValue({});

      await service.handleRevenueCatWebhook(
        {
          event: {
            type: 'INITIAL_PURCHASE',
            app_user_id: 'u1',
            product_id: 'premium_yearly_2024',
          },
        },
        sig,
      );

      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            plan: 'premium_yearly',
          }),
        }),
      );
    });
  });
});
