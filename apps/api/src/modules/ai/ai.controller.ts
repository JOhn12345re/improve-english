import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { FeedbackDto, TranslationCheckDto } from './ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('feedback')
  getExerciseFeedback(@Body() dto: FeedbackDto) {
    return this.ai.getExerciseFeedback(dto);
  }

  @Post('translation-check')
  checkTranslation(@Body() dto: TranslationCheckDto) {
    return this.ai.checkTranslation(dto);
  }
}
