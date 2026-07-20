import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('departments')
export class DepartmentsController {
  constructor(private deptService: DepartmentsService) {}

  @Get()
  findAll() {
    return this.deptService.findAll();
  }

  @Get('tree')
  findTree() {
    return this.deptService.findTree();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deptService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDepartmentDto) {
    return this.deptService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.deptService.update(id, dto);
  }

  @Delete(':id')
  disable(@Param('id') id: string) {
    return this.deptService.disable(id);
  }
}
