import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { QueryMembershipDto } from './dto/query-membership.dto';
import { ReviewMembershipDto } from './dto/review-membership.dto';
import { RefundRequestDto } from './dto/refund-request.dto';

const MEMBER_NO_LOCK_KEY = 2_607_202;

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  private async generateMemberNo(tx: Prisma.TransactionClient): Promise<string> {
    await tx.$queryRaw(
      Prisma.sql`SELECT pg_advisory_xact_lock(${MEMBER_NO_LOCK_KEY})`,
    );
    const prefix = `M${new Date().toISOString().slice(0, 7).replace('-', '')}`;
    const count = await tx.membership.count({
      where: { memberNo: { startsWith: prefix } },
    });
    return `${prefix}${String(count + 1).padStart(5, '0')}`;
  }

  async findAll(currentUser: any, query: QueryMembershipDto) {
    const page = parseInt(query.page ?? '1', 10);
    const pageSize = Math.min(parseInt(query.pageSize ?? '20', 10), 100);
    const where: Prisma.MembershipWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.customerId) where.customerId = query.customerId;

    if (currentUser.role === 'MEMBER') {
      where.customer = { assignedTo: currentUser.id };
    } else if (currentUser.role === 'HEAD') {
      where.customer = { departmentId: currentUser.departmentId };
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.membership.count({ where }),
      this.prisma.membership.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          memberLevel: { select: { id: true, name: true } },
          submitter: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { total, page, pageSize, data };
  }

  async findPending(currentUser: any) {
    if (currentUser.role !== 'HEAD' && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('无权访问');
    }
    const where: Prisma.MembershipWhereInput = {
      status: { in: ['PENDING', 'REFUND_PENDING'] },
    };
    if (currentUser.role === 'HEAD') {
      where.customer = { departmentId: currentUser.departmentId };
    }
    return this.prisma.membership.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true, departmentId: true } },
        memberLevel: { select: { id: true, name: true } },
        submitter: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(dto: CreateMembershipDto, currentUser: any) {
    const customer = await this.prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException('客户不存在');
    if (customer.status !== 'ACTIVE') throw new BadRequestException('客户已停用');
    if (currentUser.role === 'MEMBER' && customer.assignedTo !== currentUser.id) {
      throw new ForbiddenException('只能为名下客户提交会员申请');
    }
    if (currentUser.role === 'HEAD' && customer.departmentId !== currentUser.departmentId) {
      throw new ForbiddenException('只能为本部门客户提交会员申请');
    }
    await this.validateMembershipInput(dto);
    return this.prisma.$transaction(async (tx) => {
      const memberNo = await this.generateMemberNo(tx);
      return tx.membership.create({
        data: {
          memberNo,
          customerId: dto.customerId,
          memberLevelId: dto.memberLevelId,
          fee: new Prisma.Decimal(dto.fee),
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          status: 'PENDING',
          submittedBy: currentUser.id,
        },
      });
    });
  }

  async resubmit(id: string, dto: CreateMembershipDto, currentUser: any) {
    const membership = await this.prisma.membership.findUnique({
      where: { id },
      include: { customer: { select: { assignedTo: true } } },
    });
    if (!membership) throw new NotFoundException('会员申请不存在');
    if (membership.status !== 'REJECTED') throw new BadRequestException('只有已拒绝的申请可以重新提交');
    if (membership.submittedBy !== currentUser.id) throw new ForbiddenException('无权操作');
    if (membership.customer.assignedTo !== currentUser.id) {
      throw new ForbiddenException('客户已转移，无法重新提交申请');
    }
    if (dto.customerId !== membership.customerId) {
      throw new BadRequestException('重新提交时不能变更客户');
    }
    await this.validateMembershipInput(dto);
    return this.prisma.membership.update({
      where: { id },
      data: {
        fee: new Prisma.Decimal(dto.fee),
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        memberLevelId: dto.memberLevelId,
        paidAt: null,
        status: 'PENDING',
        reviewedBy: null,
        reviewedAt: null,
        reviewNote: null,
      },
    });
  }

  async approve(id: string, dto: ReviewMembershipDto, currentUser: any) {
    if (!dto.paidAt) throw new BadRequestException('审批通过时必须填写实际收款时间');
    const paidAt = new Date(dto.paidAt);
    return this.prisma.$transaction(async (tx) => {
      const membership = await tx.membership.findUnique({
        where: { id },
        include: { customer: { include: { assignedUser: { include: { department: true } } } } },
      });
      if (!membership) throw new NotFoundException('会员申请不存在');
      if (membership.status !== 'PENDING') throw new ConflictException('申请状态已变更，请刷新后重试');
      if (currentUser.role === 'HEAD' && membership.customer.departmentId !== currentUser.departmentId) {
        throw new ForbiddenException('无权审批');
      }

      await this.transitionStatus(tx, id, 'PENDING', {
        status: 'APPROVED',
        reviewedBy: currentUser.id,
        reviewedAt: new Date(),
        reviewNote: dto.reviewNote,
        paidAt,
      });

      const config = await tx.commissionConfig.findFirst({
        where: { effectiveFrom: { lte: new Date() } },
        orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
      });
      if (!config) throw new BadRequestException('未找到生效的分成配置，请先配置分成比例');

      const assignedUser = membership.customer.assignedUser;
      const userDept = assignedUser.department;
      const deptHeadUserId = userDept?.headId && userDept.headId !== assignedUser.id ? userDept.headId : null;

      let marketHeadUserId: string | null = null;
      if (userDept?.parentId) {
        const parentDept = await tx.department.findUnique({
          where: { id: userDept.parentId },
          select: { id: true, type: true, headId: true },
        });
        if (parentDept?.type === 'MARKET') {
          marketHeadUserId = parentDept.headId && parentDept.headId !== assignedUser.id ? parentDept.headId : null;
        }
      }

      const fee = membership.fee;
      const memberAmount = fee.mul(config.memberRatio).div(100).toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN);
      const deptHeadAmount = deptHeadUserId
        ? fee.mul(config.deptHeadRatio).div(100).toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN)
        : new Prisma.Decimal(0);
      const marketHeadAmount = marketHeadUserId
        ? fee.mul(config.marketHeadRatio).div(100).toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN)
        : new Prisma.Decimal(0);
      const companyAmount = fee.minus(memberAmount).minus(deptHeadAmount).minus(marketHeadAmount);

      const commissions = [
        { role: 'MEMBER', userId: assignedUser.id, amount: memberAmount, ratio: config.memberRatio },
        { role: 'DEPT_HEAD', userId: deptHeadUserId, amount: deptHeadAmount, ratio: config.deptHeadRatio },
        { role: 'MARKET_HEAD', userId: marketHeadUserId, amount: marketHeadAmount, ratio: config.marketHeadRatio },
        { role: 'COMPANY', userId: null as string | null, amount: companyAmount, ratio: config.companyRatio },
      ];

      for (const c of commissions) {
        await tx.commissionRecord.create({
          data: {
            businessKey: `earn:${id}:${c.role}`,
            membershipId: id,
            departmentId: userDept?.id ?? membership.customer.departmentId,
            entryType: 'EARNING',
            receiverUserId: c.userId,
            receiverRole: c.role as any,
            amount: c.amount,
            ratio: c.ratio,
            status: 'PENDING',
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'MEMBERSHIP_APPROVE',
          entityType: 'Membership',
          entityId: id,
          operatorId: currentUser.id,
          after: { status: 'APPROVED', fee: fee.toString() } as any,
        },
      });
    });
  }

  async reject(id: string, dto: ReviewMembershipDto, currentUser: any) {
    if (!dto.reviewNote?.trim()) throw new BadRequestException('拒绝原因不能为空');
    const membership = await this.prisma.membership.findUnique({
      where: { id },
      include: { customer: { select: { departmentId: true } } },
    });
    if (!membership) throw new NotFoundException('会员申请不存在');
    if (membership.status !== 'PENDING') throw new ConflictException('申请状态已变更');
    if (currentUser.role === 'HEAD' && membership.customer.departmentId !== currentUser.departmentId) {
      throw new ForbiddenException('无权操作');
    }
    return this.prisma.$transaction(async (tx) => {
      await this.transitionStatus(tx, id, 'PENDING', {
        status: 'REJECTED',
        reviewedBy: currentUser.id,
        reviewedAt: new Date(),
        reviewNote: dto.reviewNote,
      });
      await tx.auditLog.create({
        data: {
          action: 'MEMBERSHIP_REJECT',
          entityType: 'Membership',
          entityId: id,
          operatorId: currentUser.id,
          after: { status: 'REJECTED', reviewNote: dto.reviewNote },
        },
      });
      return tx.membership.findUnique({ where: { id } });
    });
  }

  async requestRefund(id: string, dto: RefundRequestDto, currentUser: any) {
    const membership = await this.prisma.membership.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!membership) throw new NotFoundException('会员申请不存在');
    if (membership.status !== 'APPROVED') throw new BadRequestException('只有有效会员才能申请退款');
    this.assertCustomerScope(membership.customer, currentUser);
    return this.prisma.$transaction(async (tx) => {
      await this.transitionStatus(tx, id, 'APPROVED', {
        status: 'REFUND_PENDING',
        refundReason: dto.refundReason,
      });
      await tx.auditLog.create({
        data: {
          action: 'REFUND_REQUEST',
          entityType: 'Membership',
          entityId: id,
          operatorId: currentUser.id,
          after: { status: 'REFUND_PENDING', refundReason: dto.refundReason },
        },
      });
      return tx.membership.findUnique({ where: { id } });
    });
  }

  async approveRefund(id: string, currentUser: any) {
    return this.prisma.$transaction(async (tx) => {
      const membership = await tx.membership.findUnique({
        where: { id },
        include: { customer: true },
      });
      if (!membership) throw new NotFoundException('会员申请不存在');
      if (membership.status !== 'REFUND_PENDING') throw new ConflictException('申请状态已变更');
      this.assertCustomerScope(membership.customer, currentUser);

      await this.transitionStatus(tx, id, 'REFUND_PENDING', {
        status: 'REFUNDED',
        refundReviewedBy: currentUser.id,
        refundReviewedAt: new Date(),
        refundAt: new Date(),
      });

      const originals = await tx.commissionRecord.findMany({
        where: { membershipId: id, entryType: 'EARNING' },
      });

      for (const orig of originals) {
        await tx.commissionRecord.create({
          data: {
            businessKey: `refund:${id}:${orig.receiverRole}`,
            membershipId: id,
            departmentId: orig.departmentId,
            entryType: 'REVERSAL',
            receiverUserId: orig.receiverUserId,
            receiverRole: orig.receiverRole,
            amount: orig.amount.neg(),
            ratio: orig.ratio,
            status: 'PENDING',
            originalRecordId: orig.id,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'REFUND_APPROVE',
          entityType: 'Membership',
          entityId: id,
          operatorId: currentUser.id,
          after: { status: 'REFUNDED' } as any,
        },
      });
    });
  }

  async rejectRefund(id: string, dto: ReviewMembershipDto, currentUser: any) {
    const membership = await this.prisma.membership.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!membership) throw new NotFoundException('会员申请不存在');
    if (membership.status !== 'REFUND_PENDING') throw new ConflictException('申请状态已变更');
    this.assertCustomerScope(membership.customer, currentUser);
    if (!dto.reviewNote?.trim()) throw new BadRequestException('拒绝原因不能为空');
    return this.prisma.$transaction(async (tx) => {
      await this.transitionStatus(tx, id, 'REFUND_PENDING', {
        status: 'APPROVED',
        refundReviewedBy: currentUser.id,
        refundReviewedAt: new Date(),
        reviewNote: dto.reviewNote,
      });
      await tx.auditLog.create({
        data: {
          action: 'REFUND_REJECT',
          entityType: 'Membership',
          entityId: id,
          operatorId: currentUser.id,
          after: { status: 'APPROVED', reviewNote: dto.reviewNote },
        },
      });
      return tx.membership.findUnique({ where: { id } });
    });
  }

  private async transitionStatus(
    tx: Prisma.TransactionClient,
    id: string,
    expectedStatus: 'PENDING' | 'APPROVED' | 'REFUND_PENDING',
    data: Prisma.MembershipUncheckedUpdateManyInput,
  ) {
    const result = await tx.membership.updateMany({
      where: { id, status: expectedStatus },
      data,
    });
    if (result.count !== 1) {
      throw new ConflictException('申请状态已变更，请刷新后重试');
    }
  }

  private assertCustomerScope(customer: { assignedTo: string; departmentId: string }, currentUser: any) {
    if (currentUser.role === 'ADMIN') return;
    if (currentUser.role === 'HEAD' && customer.departmentId === currentUser.departmentId) return;
    if (currentUser.role === 'MEMBER' && customer.assignedTo === currentUser.id) return;
    throw new ForbiddenException('无权操作该客户的会员记录');
  }

  private async validateMembershipInput(dto: CreateMembershipDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate <= startDate) throw new BadRequestException('会员结束日期必须晚于开始日期');
    if (dto.memberLevelId) {
      const level = await this.prisma.memberLevel.findUnique({ where: { id: dto.memberLevelId } });
      if (!level || level.status !== 'ACTIVE') {
        throw new BadRequestException('会员等级不存在或已停用');
      }
    }
  }
}
