import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VocabularyService, ReviewVocabularyDto } from './vocabulary.service';

@Controller('vocabulary')
@UseGuards(AuthGuard('jwt'))
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get('due')
  async getDue(@Req() req: { user: { id: string } }) {
    return this.vocabularyService.getDueWords(req.user.id);
  }

  @Post('review')
  async review(
    @Req() req: { user: { id: string } },
    @Body() dto: ReviewVocabularyDto,
  ) {
    return this.vocabularyService.reviewWord(req.user.id, dto);
  }
}
