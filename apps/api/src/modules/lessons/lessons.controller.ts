import { Controller, Get, Param, Req } from '@nestjs/common';
import { CefrLevel } from '@englishflow/shared-types';
import { LessonsService } from './lessons.service';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  async findAll(
    @Req() req: { user?: { level: CefrLevel; isPremium: boolean } },
  ) {
    const level = req.user?.level ?? CefrLevel.A1;
    const isPremium = req.user?.isPremium ?? false;
    return this.lessonsService.findByLevel(level, isPremium);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: { user?: { level: CefrLevel } },
  ) {
    return this.lessonsService.findById(id, req.user?.level ?? CefrLevel.C2);
  }
}
