import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VoaIngesterService } from './voa.service';

@Injectable()
export class VoaCron {
  private readonly logger = new Logger(VoaCron.name);

  constructor(private readonly voaIngester: VoaIngesterService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM, { timeZone: 'Europe/Paris' })
  async dailyIngest(): Promise<void> {
    this.logger.log('VOA daily cron triggered');
    await this.voaIngester.ingestAll();
  }
}
