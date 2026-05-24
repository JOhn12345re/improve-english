import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService, CreateProfileDto } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: { user: { id: string; email: string } }) {
    return this.usersService.findById(req.user.id);
  }

  @Post('profile')
  async createProfile(
    @Req() req: { user: { id: string; email: string } },
    @Body() dto: CreateProfileDto,
  ) {
    return this.usersService.createProfile(req.user.id, req.user.email, dto);
  }

  @Get('me/export')
  async exportData(@Req() req: { user: { id: string } }) {
    return this.usersService.exportData(req.user.id);
  }

  @Delete('me')
  async deleteAccount(@Req() req: { user: { id: string } }) {
    return this.usersService.requestDeletion(req.user.id);
  }
}
