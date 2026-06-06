import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RgpdPurgeCron } from './rgpd-purge.cron';

@Module({
  controllers: [UsersController],
  providers: [UsersService, RgpdPurgeCron],
  exports: [UsersService],
})
export class UsersModule {}
