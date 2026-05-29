import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { CecrlClassifierService } from './cecrl-classifier.service';
import { CecrlClassifierCron } from './cecrl-classifier.cron';

@Module({
  imports: [PrismaModule],
  providers: [CecrlClassifierService, CecrlClassifierCron],
  exports: [CecrlClassifierService],
})
export class ClassifierModule {}
