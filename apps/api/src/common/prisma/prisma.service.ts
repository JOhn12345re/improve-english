import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout (30s)')), 30_000),
    );
    await Promise.race([this.$connect(), timeout]);
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
