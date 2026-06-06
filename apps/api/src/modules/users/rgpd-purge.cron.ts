import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as cron from 'node-cron';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class RgpdPurgeCron implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RgpdPurgeCron.name);
  private task: cron.ScheduledTask | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    // Every day at 2 AM — hard-delete users whose 14-day grace period has expired
    this.task = cron.schedule('0 2 * * *', () => this.purgeExpiredUsers(), {
      timezone: 'Europe/Paris',
    });
    this.logger.log('RGPD purge cron scheduled (2 AM daily)');
  }

  onModuleDestroy() {
    this.task?.stop();
  }

  async purgeExpiredUsers(): Promise<void> {
    try {
      const now = new Date();

      // Find users whose deletion grace period has expired
      const expiredUsers = await this.prisma.user.findMany({
        where: {
          deleted_at: { not: null, lte: now },
        },
        select: { id: true, email: true },
      });

      if (expiredUsers.length === 0) return;

      this.logger.log(`Purging ${expiredUsers.length} expired user(s)`);

      for (const user of expiredUsers) {
        await this.prisma.$transaction([
          this.prisma.userVocabulary.deleteMany({ where: { user_id: user.id } }),
          this.prisma.userProgress.deleteMany({ where: { user_id: user.id } }),
          this.prisma.subscription.deleteMany({ where: { user_id: user.id } }),
          this.prisma.user.delete({ where: { id: user.id } }),
        ]);
        this.logger.log(`Purged user ${user.id} (${user.email})`);
      }

      this.logger.log(`RGPD purge complete: ${expiredUsers.length} user(s) removed`);
    } catch (err) {
      this.logger.error('RGPD purge cron failed', err);
    }
  }
}
