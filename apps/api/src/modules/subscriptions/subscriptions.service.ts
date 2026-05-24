import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SubscriptionPlan, SubscriptionStatus } from '@englishflow/shared-types';
import { TRIAL_DAYS } from '../../config/limits';
import * as crypto from 'crypto';

interface RevenueCatWebhookPayload {
  event: {
    type: string;
    app_user_id: string;
    product_id: string;
    expiration_at_ms?: number;
  };
}

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getSubscription(userId: string) {
    return this.prisma.subscription.findUnique({ where: { user_id: userId } });
  }

  async isPremium(userId: string): Promise<boolean> {
    const sub = await this.getSubscription(userId);
    if (!sub) return false;
    if (sub.status !== 'active' && sub.status !== 'trial') return false;
    if (sub.expires_at && new Date() > sub.expires_at) return false;
    return sub.plan !== 'free';
  }

  /**
   * Webhook RevenueCat — toujours verifier l'entitlement cote backend.
   * Jamais se fier uniquement au client.
   */
  async handleRevenueCatWebhook(payload: RevenueCatWebhookPayload, signature: string) {
    this.verifyWebhookSignature(signature);

    const { type, app_user_id, product_id, expiration_at_ms } = payload.event;

    const plan = this.mapProductToPlan(product_id);
    const expiresAt = expiration_at_ms ? new Date(expiration_at_ms) : null;

    switch (type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
        await this.prisma.subscription.update({
          where: { user_id: app_user_id },
          data: { plan: plan as never, status: 'active', expires_at: expiresAt },
        });
        break;
      case 'CANCELLATION':
      case 'EXPIRATION':
        await this.prisma.subscription.update({
          where: { user_id: app_user_id },
          data: { status: 'expired' },
        });
        break;
      case 'TRIAL_STARTED':
        await this.prisma.subscription.update({
          where: { user_id: app_user_id },
          data: { status: 'trial', plan: plan as never },
        });
        break;
    }
  }

  private verifyWebhookSignature(signature: string) {
    const secret = this.config.getOrThrow<string>('REVENUECAT_WEBHOOK_SECRET');
    const expected = crypto.createHmac('sha256', secret).digest('hex');
    if (signature !== expected) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }

  private mapProductToPlan(productId: string): SubscriptionPlan {
    if (productId.includes('yearly')) return SubscriptionPlan.PREMIUM_YEARLY;
    return SubscriptionPlan.PREMIUM_MONTHLY;
  }
}
