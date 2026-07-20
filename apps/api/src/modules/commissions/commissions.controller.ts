import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('commissions')
export class CommissionsController {
  constructor(private service: CommissionsService) {}

  @Get('my')
  findMy(@CurrentUser() user: any, @Query() query: any) {
    return this.service.findMy(user.id, query);
  }

  @UseGuards(RolesGuard) @Roles('HEAD', 'ADMIN')
  @Get('department')
  findDepartment(@CurrentUser() user: any, @Query() query: any) {
    return this.service.findDepartment(user.departmentId, query);
  }

  @UseGuards(RolesGuard) @Roles('ADMIN')
  @Get('overview')
  findOverview(@Query() query: any) {
    return this.service.findOverview(query);
  }

  @UseGuards(RolesGuard) @Roles('ADMIN')
  @Get('periods')
  getPeriods(@Query() query: any) {
    return this.service.getPeriods(query);
  }

  @UseGuards(RolesGuard) @Roles('ADMIN')
  @Post('settle/:periodId')
  settle(@Param('periodId') periodId: string, @CurrentUser() user: any) {
    return this.service.settle(periodId, user.id);
  }
}
