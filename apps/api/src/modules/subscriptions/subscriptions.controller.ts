import { Body, Controller, Get, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMine(@Req() req: { user: { id: string } }) {
    return this.subscriptionsService.getSubscription(req.user.id);
  }

  // Route webhook RevenueCat — pas de JWT, verif par signature HMAC
  @Post('webhook/revenuecat')
  async revenueCatWebhook(
    @Body() payload: { event: { type: string; app_user_id: string; product_id: string; expiration_at_ms?: number } },
    @Headers('x-revenuecat-signature') signature: string,
  ) {
    await this.subscriptionsService.handleRevenueCatWebhook(payload, signature ?? '');
    return { received: true };
  }
}
