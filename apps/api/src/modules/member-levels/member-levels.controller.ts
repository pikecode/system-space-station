import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { MemberLevelsService } from './member-levels.service';
import { CreateMemberLevelDto } from './dto/create-member-level.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('member-levels')
export class MemberLevelsController {
  constructor(private memberLevelsService: MemberLevelsService) {}

  @Get()
  findAll() {
    return this.memberLevelsService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateMemberLevelDto) {
    return this.memberLevelsService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateMemberLevelDto) {
    return this.memberLevelsService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  disable(@Param('id') id: string) {
    return this.memberLevelsService.disable(id);
  }
}
