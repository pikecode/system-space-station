import { Controller, ForbiddenException, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { canWrite, resolveDataScope } from '../../common/data-scope';

@UseGuards(JwtAuthGuard)
@Controller('commissions')
export class CommissionsController {
  constructor(private service: CommissionsService) {}

  @Get('my')
  findMy(@CurrentUser() user: any, @Query() query: any) {
    this.assertCanViewCommissions(user);
    return this.service.findMy(user.id, query);
  }

  @Get('my-summary')
  getMySummary(@CurrentUser() user: any) {
    this.assertCanViewCommissions(user);
    return this.service.getSummary({ receiverUserId: user.id });
  }

  @UseGuards(RolesGuard) @Roles('HEAD', 'ADMIN')
  @Get('department')
  findDepartment(@CurrentUser() user: any, @Query() query: any) {
    this.assertCanViewCommissions(user);
    return this.service.findDepartment(user.departmentId, query);
  }

  @UseGuards(RolesGuard) @Roles('HEAD', 'ADMIN')
  @Get('department-summary')
  getDepartmentSummary(@CurrentUser() user: any) {
    this.assertCanViewCommissions(user);
    return this.service.getSummary({ departmentId: user.departmentId });
  }

  @UseGuards(RolesGuard) @Roles('ADMIN')
  @Get('overview')
  findOverview(@Query() query: any) {
    return this.service.findOverview(query);
  }

  @UseGuards(RolesGuard) @Roles('ADMIN')
  @Get('overview-summary')
  getOverviewSummary() {
    return this.service.getSummary({});
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

  private assertCanViewCommissions(user: any) {
    if (user?.role === 'ADMIN') return;
    if (!canWrite(resolveDataScope(user))) {
      throw new ForbiddenException('当前账号仅可查看客户信息，无法查看分成明细');
    }
  }
}
