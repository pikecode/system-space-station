import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { MembershipsService } from './memberships.service';

describe('MembershipsService', () => {
  it('拒绝跨部门负责人发起退款', async () => {
    const prisma = {
      membership: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'membership-1',
          status: 'APPROVED',
          customer: { assignedTo: 'member-1', departmentId: 'department-a' },
        }),
      },
    };
    const service = new MembershipsService(prisma as never);

    await expect(service.requestRefund(
      'membership-1',
      { refundReason: '客户申请' },
      { id: 'head-b', role: 'HEAD', departmentId: 'department-b' },
    )).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('审批通过必须提供实际收款时间', async () => {
    const service = new MembershipsService({} as never);
    await expect(service.approve(
      'membership-1',
      {},
      { id: 'head-a', role: 'HEAD', departmentId: 'department-a' },
    )).rejects.toBeInstanceOf(BadRequestException);
  });

  it('退款冲账复制原分成的部门快照', async () => {
    const commissionCreate = vi.fn().mockResolvedValue({});
    const tx = {
      membership: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'membership-1',
          status: 'REFUND_PENDING',
          customer: { assignedTo: 'member-1', departmentId: 'department-a' },
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      commissionRecord: {
        findMany: vi.fn().mockResolvedValue([{
          id: 'commission-1',
          departmentId: 'department-at-approval',
          receiverUserId: 'member-1',
          receiverRole: 'MEMBER',
          amount: new Prisma.Decimal(40),
          ratio: new Prisma.Decimal(40),
        }]),
        create: commissionCreate,
      },
      auditLog: { create: vi.fn().mockResolvedValue({}) },
    };
    const service = new MembershipsService({
      $transaction: vi.fn((callback) => callback(tx)),
    } as never);

    await service.approveRefund(
      'membership-1',
      { id: 'head-a', role: 'HEAD', departmentId: 'department-a' },
    );

    expect(commissionCreate.mock.calls[0][0].data.departmentId)
      .toBe('department-at-approval');
  });
});
