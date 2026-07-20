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
  ) {
    return this.usersService.findAll({ departmentId, role, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/transfer')
  transfer(@Param('id') id: string, @Body() dto: TransferUserDto) {
    return this.usersService.transfer(id, dto);
  }

  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body() dto: SetStatusDto) {
    return this.usersService.setStatus(id, dto.status, dto.successorId);
  }
}
