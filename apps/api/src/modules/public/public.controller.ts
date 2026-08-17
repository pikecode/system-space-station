import { Controller, Get, Post, Param, Body, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PublicRegisterDto } from './dto/register-customer.dto';
import { CustomerSource } from '@prisma/client';

@Controller('public')
export class PublicController {
  constructor(private prisma: PrismaService) {}

  @Get('invite/:shareCode')
  async getInviter(@Param('shareCode') shareCode: string) {
    const user = await this.prisma.user.findUnique({
      where: { shareCode },
      select: {
        id: true,
        name: true,
        department: { select: { name: true } },
      },
    });
    if (!user) throw new NotFoundException('邀请码无效');
    return {
      inviterName: user.name,
      deptName: user.department?.name ?? '',
    };
  }

  @Post('register')
  async register(@Body() dto: PublicRegisterDto) {
    const inviter = await this.prisma.user.findUnique({
      where: { shareCode: dto.shareCode },
      select: { id: true, departmentId: true, employeeNo: true, status: true },
    });
    if (!inviter) throw new NotFoundException('邀请码无效');
    if (inviter.status !== 'ACTIVE') throw new BadRequestException('邀请人账号已停用');
    if (!inviter.departmentId) throw new BadRequestException('邀请人尚未分配部门');

    const existing = await this.prisma.customer.findFirst({
      where: { phone: dto.phone },
    });
    if (existing) throw new BadRequestException('该手机号已注册');

    const customer = await this.prisma.customer.create({
      data: {
        customerType: dto.customerType,
        name: dto.name,
        phone: dto.phone,
        wechat: dto.wechat,
        notes: dto.notes,
        gender: dto.gender,
        birthday: dto.birthday ? new Date(dto.birthday) : undefined,
        address: dto.address,
        creditCode: dto.creditCode,
        industry: dto.industry,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        source: CustomerSource.REFERRAL,
        referredBy: inviter.id,
        referrerEmployeeNo: inviter.employeeNo,
        referrerDepartmentId: inviter.departmentId,
        assignedTo: inviter.id,
        departmentId: inviter.departmentId,
        createdBy: inviter.id,
        registrationSource: 'SELF',
      },
      select: { id: true, name: true },
    });

    return { success: true, customerId: customer.id };
  }
}
