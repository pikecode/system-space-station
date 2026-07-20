import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('positions')
export class PositionsController {
  constructor(private positionsService: PositionsService) {}

  @Get()
  findAll() {
    return this.positionsService.findAll();
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreatePositionDto) {
    return this.positionsService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreatePositionDto>) {
    return this.positionsService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  disable(@Param('id') id: string) {
    return this.positionsService.disable(id);
  }
}
