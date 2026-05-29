import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { LlmModule } from '../integrations/llm/llm.module';

@Module({
  imports: [LlmModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
