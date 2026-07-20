import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ConfigService } from './config.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('config')
export class ConfigController {
  constructor(private configService: ConfigService) {}

  @Get('current')
  getCurrent() { return this.configService.getCurrent(); }

  @UseGuards(RolesGuard) @Roles('ADMIN')
  @Get('versions')
  getVersions() { return this.configService.getVersions(); }

  @UseGuards(RolesGuard) @Roles('ADMIN')
  @Post('versions')
  create(@Body() dto: CreateConfigDto, @CurrentUser() user: any) {
    return this.configService.create(dto, user.id);
  }
}
