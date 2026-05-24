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
    @Req() req: { user: { id: string }; userLevel: CefrLevel; isPremium: boolean },
  ) {
    return this.lessonsService.findByLevel(req.userLevel, req.isPremium);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: { userLevel: CefrLevel },
  ) {
    return this.lessonsService.findById(id, req.userLevel);
  }
}
