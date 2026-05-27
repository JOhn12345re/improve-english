import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CefrLevel } from '@englishflow/shared-types';
import { LessonsService } from './lessons.service';

@Controller('lessons')
@UseGuards(AuthGuard('jwt'))
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  async findAll(
    @Req() req: { user: { id: string; level: CefrLevel; isPremium: boolean } },
  ) {
    return this.lessonsService.findByLevel(req.user.level, req.user.isPremium);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: { user: { level: CefrLevel } },
  ) {
    return this.lessonsService.findById(id, req.user.level);
  }
}
