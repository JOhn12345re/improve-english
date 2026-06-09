import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProgressService, RecordProgressDto } from './progress.service';

@Controller('progress')
@UseGuards(AuthGuard('jwt'))
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  async record(
    @Req() req: { user: { id: string } },
    @Body() dto: RecordProgressDto,
  ) {
    return this.progressService.recordProgress(req.user.id, dto);
  }

  @Get()
  async getProgress(@Req() req: { user: { id: string } }) {
    return this.progressService.getUserProgress(req.user.id);
  }

  @Get('streak')
  async getStreak(@Req() req: { user: { id: string } }) {
    return this.progressService.getStreakInfo(req.user.id);
  }
}
