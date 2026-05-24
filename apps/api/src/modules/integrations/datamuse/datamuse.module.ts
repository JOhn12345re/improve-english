import { Module } from '@nestjs/common';
import { DatamuseService } from './datamuse.service';

// CacheModule is @Global() — RedisService is injected automatically

@Module({
  providers: [DatamuseService],
  exports: [DatamuseService],
})
export class DatamuseModule {}
