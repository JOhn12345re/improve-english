import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { VoaModule } from './voa/voa.module';
import { ClassifierModule } from './classifier/classifier.module';
import { LessonGeneratorModule } from './lesson-generator/lesson-generator.module';
import { PdfModule } from './pdf/pdf.module';
import { IngestionController } from './ingestion.controller';

@Module({
  imports: [
    PrismaModule,
    VoaModule,
    ClassifierModule,
    LessonGeneratorModule,
    PdfModule,
  ],
  controllers: [IngestionController],
})
export class IngestionModule {}
