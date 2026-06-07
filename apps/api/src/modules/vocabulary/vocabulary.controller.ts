import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VocabularyService, ReviewVocabularyDto } from './vocabulary.service';

@Controller('vocabulary')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get()
  async getAll(@Query('pack') pack?: string) {
    return this.vocabularyService.getWordsByPack(pack);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('due')
  async getDue(@Req() req: { user: { id: string } }) {
    return this.vocabularyService.getDueWords(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  async getStats(@Req() req: { user: { id: string } }) {
    return this.vocabularyService.getStats(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('review')
  async review(
    @Req() req: { user: { id: string } },
    @Body() dto: ReviewVocabularyDto,
  ) {
    return this.vocabularyService.reviewWord(req.user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('add-words')
  async addWords(
    @Req() req: { user: { id: string } },
    @Body() body: { words: Array<{ word: string; translation: string; level: string }> },
  ) {
    return this.vocabularyService.addWordsFromLesson(req.user.id, body.words);
  }
}
