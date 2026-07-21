import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService) {}

  async findMy(userId: string, query: { page?: string; pageSize?: string; status?: string }) {
    const page = parseInt(query.page ?? '1', 10);
    const pageSize = Math.min(parseInt(query.pageSize ?? '20', 10), 100);
    const where: any = { receiverUserId: userId };
    if (query.status) where.status = query.status;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.commissionRecord.count({ where }),
      this.prisma.commissionRecord.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize,
        include: { membership: { include: { customer: { select: { id: true, name: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { total, page, pageSize, data };
  }

  async findDepartment(departmentId: string, query: { page?: string; pageSize?: string }) {
    const page = parseInt(query.page ?? '1', 10);
    const pageSize = Math.min(parseInt(query.pageSize ?? '20', 10), 100);
    const where: any = {
      departmentId,
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.commissionRecord.count({ where }),
      this.prisma.commissionRecord.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize,
        include: {
          receiverUser: { select: { id: true, name: true } },
          membership: { include: { customer: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { total, page, pageSize, data };
  }

  async findOverview(query: { page?: string; pageSize?: string; status?: string }) {
    const page = parseInt(query.page ?? '1', 10);
    const pageSize = Math.min(parseInt(query.pageSize ?? '20', 10), 100);
    const where: any = {};
    if (query.status) where.status = query.status;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.commissionRecord.count({ where }),
      this.prisma.commissionRecord.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize,
        include: {
          receiverUser: { select: { id: true, name: true } },
          membership: { include: { customer: { select: { id: true, name: true, departmentId: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { total, page, pageSize, data };
  }

  async getPeriods(query: { status?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    return this.prisma.settlementPeriod.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });
  }

  async settle(periodId: string, operatorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const period = await tx.settlementPeriod.findUnique({ where: { id: periodId } });
      if (!period) throw new NotFoundException('结算周期不存在');
      if (period.status !== 'PENDING_PAYMENT') throw new BadRequestException('只有待出账状态的周期可以结算');

      const transitioned = await tx.settlementPeriod.updateMany({
        where: { id: periodId, status: 'PENDING_PAYMENT' },
        data: { status: 'SETTLED', settledBy: operatorId, settledAt: new Date() },
      });
      if (transitioned.count !== 1) {
        throw new ConflictException('结算周期状态已变更，请刷新后重试');
      }

      const updateResult = await tx.commissionRecord.updateMany({
        where: { periodId, status: 'PENDING_PAYMENT' },
        data: { status: 'SETTLED', settledAt: new Date() },
      });

      if (updateResult.count !== period.recordCount) {
        throw new BadRequestException(`明细数量不一致：预期 ${period.recordCount}，实际 ${updateResult.count}`);
      }

      await tx.auditLog.create({
        data: {
          action: 'PERIOD_SETTLE',
          entityType: 'SettlementPeriod',
          entityId: periodId,
          operatorId,
          after: { status: 'SETTLED' } as any,
        },
      });
    });
  }
}
