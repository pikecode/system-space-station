import { Controller, ForbiddenException, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('customer-portal')
export class CustomerPortalController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  async me(@CurrentUser() user: any) {
    this.assertCustomer(user);
    return this.prisma.customer.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        customerNo: true,
        name: true,
        phone: true,
        customerType: true,
        status: true,
        memberActivatedAt: true,
        investmentAmount: true,
        memberships: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            memberNo: true,
            status: true,
            fee: true,
            paidAt: true,
            startDate: true,
            endDate: true,
            memberLevel: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  @Get('memberships')
  async memberships(@CurrentUser() user: any) {
    this.assertCustomer(user);
    return this.prisma.membership.findMany({
      where: { customerId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        memberNo: true,
        status: true,
        fee: true,
        paidAt: true,
        paidAmount: true,
        startDate: true,
        endDate: true,
        memberLevel: { select: { id: true, name: true } },
      },
    });
  }

  private assertCustomer(user: any) {
    if (user?.subjectType !== 'CUSTOMER') {
      throw new ForbiddenException('仅客户账号可访问');
    }
  }
}
