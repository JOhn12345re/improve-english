import { Module } from '@nestjs/common';
import { LanguageToolService } from './languagetool.service';

@Module({
  providers: [LanguageToolService],
  exports: [LanguageToolService],
})
export class LanguageToolModule {}
