import { Module } from '@nestjs/common';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';
import { FsrsService } from './fsrs.service';

@Module({
  controllers: [VocabularyController],
  providers: [VocabularyService, FsrsService],
  exports: [VocabularyService],
})
export class VocabularyModule {}
