import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TransferUserDto } from './dto/transfer-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

class SetStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;

  @IsString()
  @IsOptional()
  successorId?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(
    @Query('departmentId') departmentId?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('employeeNo') employeeNo?: string,
    @Query('username') username?: string,
    @Query('name') name?: string,
    @Query('phone') phone?: string,
  ) {
    return this.usersService.findAll({
      departmentId,
      role,
      status,
      employeeNo,
      username,
      name,
      phone,
    });
  }

  @Roles('HEAD', 'ADMIN')
  @Get('department-members')
  findDepartmentMembers(
    @CurrentUser() currentUser: any,
    @Query('departmentId') departmentId?: string,
  ) {
    const targetDepartmentId = currentUser.role === 'ADMIN' ? departmentId : currentUser.departmentId;
    if (!targetDepartmentId) return [];
    return this.usersService.findDepartmentMembers(targetDepartmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser() operator: any) {
    return this.usersService.create(dto, operator.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() operator: any) {
    return this.usersService.update(id, dto, operator.id);
  }

  @Patch(':id/transfer')
  transfer(@Param('id') id: string, @Body() dto: TransferUserDto, @CurrentUser() operator: any) {
    return this.usersService.transfer(id, dto, operator.id);
  }

  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body() dto: SetStatusDto, @CurrentUser() operator: any) {
    return this.usersService.setStatus(id, dto.status, dto.successorId, operator.id);
  }
}
