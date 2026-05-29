import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { VoaModule } from './voa/voa.module';
import { IngestionController } from './ingestion.controller';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, VoaModule],
  controllers: [IngestionController],
})
export class IngestionModule {}
