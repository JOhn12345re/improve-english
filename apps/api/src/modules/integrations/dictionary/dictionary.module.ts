import { Module } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';

// CacheModule is @Global() — no need to import it here

@Module({
  providers: [DictionaryService],
  exports: [DictionaryService],
})
export class DictionaryModule {}
