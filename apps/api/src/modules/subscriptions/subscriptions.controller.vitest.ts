import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;
  let service: SubscriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionsController],
      providers: [
        {
          provide: SubscriptionsService,
          useValue: {
            getSubscription: vi.fn(),
            handleRevenueCatWebhook: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(SubscriptionsController);
    service = module.get(SubscriptionsService);
  });

  describe('GET /subscriptions/me', () => {
    it('should return user subscription', async () => {
      const sub = { user_id: 'u1', plan: 'free', status: 'active' };
      vi.spyOn(service, 'getSubscription').mockResolvedValue(sub as any);

      const result = await controller.getMine({ user: { id: 'u1' } });

      expect(result).toEqual(sub);
    });
  });

  describe('POST /subscriptions/webhook/revenuecat', () => {
    it('should process webhook and return received: true', async () => {
      vi.spyOn(service, 'handleRevenueCatWebhook').mockResolvedValue(undefined);

      const payload = {
        event: { type: 'INITIAL_PURCHASE', app_user_id: 'u1', product_id: 'premium_monthly' },
      };

      const result = await controller.revenueCatWebhook(payload, 'sig-123');

      expect(result).toEqual({ received: true });
      expect(service.handleRevenueCatWebhook).toHaveBeenCalledWith(payload, 'sig-123');
    });

    it('should handle missing signature header', async () => {
      vi.spyOn(service, 'handleRevenueCatWebhook').mockResolvedValue(undefined);

      const payload = {
        event: { type: 'CANCELLATION', app_user_id: 'u1', product_id: 'premium_monthly' },
      };

      const result = await controller.revenueCatWebhook(payload, undefined as any);

      // Controller defaults to empty string when signature is undefined
      expect(service.handleRevenueCatWebhook).toHaveBeenCalledWith(payload, '');
    });
  });
});
