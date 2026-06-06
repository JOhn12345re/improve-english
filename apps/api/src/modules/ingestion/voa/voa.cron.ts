import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as cron from 'node-cron';
import { VoaIngesterService } from './voa.service';

@Injectable()
export class VoaCron implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VoaCron.name);
  private task: cron.ScheduledTask | null = null;

  constructor(private readonly voaIngester: VoaIngesterService) {}

  onModuleInit() {
    // Every day at 3 AM (Europe/Paris)
    this.task = cron.schedule('0 3 * * *', () => this.dailyIngest(), {
      timezone: 'Europe/Paris',
    });
    this.logger.log('VOA daily cron scheduled (3 AM Europe/Paris)');
  }

  onModuleDestroy() {
    this.task?.stop();
  }

  async dailyIngest(): Promise<void> {
    this.logger.log('VOA daily cron triggered');
    try {
      await this.voaIngester.ingestAll();
    } catch (err) {
      this.logger.error('VOA daily cron failed', err);
    }
  }
}
