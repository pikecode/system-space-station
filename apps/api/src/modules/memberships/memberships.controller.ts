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
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { ReviewMembershipDto } from './dto/review-membership.dto';
import { RefundRequestDto } from './dto/refund-request.dto';
import { QueryMembershipDto } from './dto/query-membership.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('memberships')
export class MembershipsController {
  constructor(private membershipsService: MembershipsService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: QueryMembershipDto) {
    return this.membershipsService.findAll(user, query);
  }

  @UseGuards(RolesGuard)
  @Roles('HEAD', 'ADMIN')
  @Get('pending')
  findPending(@CurrentUser() user: any) {
    return this.membershipsService.findPending(user);
  }

  @UseGuards(RolesGuard)
  @Roles('MEMBER', 'HEAD')
  @Post()
  create(@Body() dto: CreateMembershipDto, @CurrentUser() user: any) {
    return this.membershipsService.create(dto, user);
  }

  @UseGuards(RolesGuard)
  @Roles('HEAD', 'ADMIN')
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() dto: ReviewMembershipDto, @CurrentUser() user: any) {
    return this.membershipsService.approve(id, dto, user);
  }

  @UseGuards(RolesGuard)
  @Roles('HEAD', 'ADMIN')
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() dto: ReviewMembershipDto, @CurrentUser() user: any) {
    return this.membershipsService.reject(id, dto, user);
  }

  @Patch(':id/resubmit')
  resubmitAlias(@Param('id') id: string, @Body() dto: CreateMembershipDto, @CurrentUser() user: any) {
    return this.membershipsService.resubmit(id, dto, user);
  }

  @Post(':id/refund')
  requestRefund(@Param('id') id: string, @Body() dto: RefundRequestDto, @CurrentUser() user: any) {
    return this.membershipsService.requestRefund(id, dto, user);
  }

  @UseGuards(RolesGuard)
  @Roles('HEAD', 'ADMIN')
  @Patch(':id/refund/approve')
  approveRefund(@Param('id') id: string, @CurrentUser() user: any) {
    return this.membershipsService.approveRefund(id, user);
  }

  @UseGuards(RolesGuard)
  @Roles('HEAD', 'ADMIN')
  @Patch(':id/refund/reject')
  rejectRefund(@Param('id') id: string, @Body() dto: ReviewMembershipDto, @CurrentUser() user: any) {
    return this.membershipsService.rejectRefund(id, dto, user);
  }

  @UseGuards(RolesGuard)
  @Roles('MEMBER')
  @Patch(':id')
  resubmit(@Param('id') id: string, @Body() dto: CreateMembershipDto, @CurrentUser() user: any) {
    return this.membershipsService.resubmit(id, dto, user);
  }
}
