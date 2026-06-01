import { Controller, Get, Param, Req } from '@nestjs/common';
import { LessonsService } from './lessons.service';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  async findAll(
    @Req() req: { user?: { isPremium: boolean } },
  ) {
    const isPremium = req.user?.isPremium ?? false;
    return this.lessonsService.findAll(isPremium);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.lessonsService.findById(id);
  }
}
