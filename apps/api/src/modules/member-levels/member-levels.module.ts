import { Module } from '@nestjs/common';
import { MemberLevelsController } from './member-levels.controller';
import { MemberLevelsService } from './member-levels.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MemberLevelsController],
  providers: [MemberLevelsService],
  exports: [MemberLevelsService],
})
export class MemberLevelsModule {}
