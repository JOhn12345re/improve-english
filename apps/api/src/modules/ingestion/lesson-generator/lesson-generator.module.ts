import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { LlmModule } from '../../integrations/llm/llm.module';
import { LessonGeneratorService } from './lesson-generator.service';
import { LessonGeneratorCron } from './lesson-generator.cron';

@Module({
  imports: [PrismaModule, LlmModule],
  providers: [LessonGeneratorService, LessonGeneratorCron],
  exports: [LessonGeneratorService],
})
export class LessonGeneratorModule {}
