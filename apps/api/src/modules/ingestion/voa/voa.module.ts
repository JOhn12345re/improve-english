import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { VoaIngesterService } from './voa.service';
import { VoaCron } from './voa.cron';

@Module({
  imports: [PrismaModule],
  providers: [VoaIngesterService, VoaCron],
  exports: [VoaIngesterService],
})
export class VoaModule {}
