import { Module } from '@nestjs/common';
import { TatoebaService } from './tatoeba.service';

// PrismaModule is already imported globally via AppModule

@Module({
  providers: [TatoebaService],
  exports: [TatoebaService],
})
export class TatoebaModule {}
