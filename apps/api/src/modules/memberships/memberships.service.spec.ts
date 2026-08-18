import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { MembershipsService } from './memberships.service';

describe('MembershipsService', () => {
  it('提交会员申请时写入当前维护人与部门快照', async () => {
    const create = vi.fn().mockResolvedValue({});
    const tx = {
      $executeRaw: vi.fn(),
      membership: {
        count: vi.fn().mockResolvedValue(0),
        create,
      },
    };
    const service = new MembershipsService({
      customer: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'customer-1',
          status: 'ACTIVE',
          assignedTo: 'member-1',
          departmentId: 'department-a',
        }),
      },
      $transaction: vi.fn((callback) => callback(tx)),
    } as never);

    await service.create({
      customerId: 'customer-1',
      fee: 1000,
      startDate: '2026-08-17',
      endDate: '2027-08-17',
    }, { id: 'member-1', role: 'MEMBER', departmentId: 'department-a' });

    expect(create.mock.calls[0][0].data).toMatchObject({
      submittedDepartmentId: 'department-a',
      submittedAssignedTo: 'member-1',
    });
  });

  it('发展中心负责人只能查看，不能提交会员申请', async () => {
    const service = new MembershipsService({
      customer: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'customer-1',
          status: 'ACTIVE',
          assignedTo: 'member-1',
          departmentId: 'department-a',
        }),
      },
    } as never);

    await expect(service.create({
      customerId: 'customer-1',
      fee: 1000,
      startDate: '2026-08-17',
      endDate: '2027-08-17',
    }, {
      id: 'development-head',
      role: 'HEAD',
      departmentId: 'development-center',
      departmentType: 'CENTER',
      departmentName: '发展中心',
    })).rejects.toThrow('当前角色无权提交该客户的会员申请');
  });

  it('市场部负责人可以查看下属事业部会员', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const service = new MembershipsService({
      department: {
        findMany: vi.fn().mockResolvedValue([{ id: 'division-1' }]),
      },
      membership: { count, findMany },
      $transaction: vi.fn((operations) => Promise.all(operations)),
    } as never);

    await service.findAll({
      id: 'market-head',
      role: 'HEAD',
      departmentId: 'market-1',
      departmentType: 'MARKET',
    }, {});

    expect(count.mock.calls[0][0].where.customer).toEqual({
      departmentId: { in: ['market-1', 'division-1'] },
    });
    expect(findMany.mock.calls[0][0].where.customer).toEqual({
      departmentId: { in: ['market-1', 'division-1'] },
    });
  });

  it('审批通过时写入审批时维护人与部门快照', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const tx = {
      membership: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'membership-1',
          status: 'PENDING',
          fee: new Prisma.Decimal(1000),
          customer: {
            departmentId: 'department-at-approval',
            assignedTo: 'member-1',
            assignedUser: {
              id: 'member-1',
              department: {
                id: 'department-at-approval',
                headId: 'head-1',
                parentId: null,
              },
            },
          },
        }),
        updateMany,
      },
      commissionConfig: {
        findFirst: vi.fn().mockResolvedValue({
          memberRatio: new Prisma.Decimal(40),
          deptHeadRatio: new Prisma.Decimal(20),
          marketHeadRatio: new Prisma.Decimal(0),
          companyRatio: new Prisma.Decimal(40),
        }),
      },
      commissionRecord: { create: vi.fn().mockResolvedValue({}) },
      auditLog: { create: vi.fn().mockResolvedValue({}) },
    };
    const service = new MembershipsService({
      $transaction: vi.fn((callback) => callback(tx)),
    } as never);

    await service.approve(
      'membership-1',
      { paidAt: '2026-08-17T10:00:00.000Z' },
      { id: 'head-1', role: 'HEAD', departmentId: 'department-at-approval', departmentType: 'DIVISION' },
    );

    expect(updateMany.mock.calls[0][0].data).toMatchObject({
      approvedDepartmentId: 'department-at-approval',
      approvedAssignedTo: 'member-1',
    });
  });

  it('发展中心负责人不能审批会员申请', async () => {
    const tx = {
      membership: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'membership-1',
          status: 'PENDING',
          customer: {
            departmentId: 'department-a',
            assignedTo: 'member-1',
            assignedUser: {
              id: 'member-1',
              department: { id: 'department-a', headId: 'head-a', parentId: null },
            },
          },
        }),
      },
    };
    const service = new MembershipsService({
      $transaction: vi.fn((callback) => callback(tx)),
    } as never);

    await expect(service.approve(
      'membership-1',
      { paidAt: '2026-08-17T10:00:00.000Z' },
      {
        id: 'development-head',
        role: 'HEAD',
        departmentId: 'development-center',
        departmentType: 'CENTER',
        departmentName: '发展中心',
      },
    )).rejects.toThrow('无权审批');
  });

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
      { id: 'head-b', role: 'HEAD', departmentId: 'department-b', departmentType: 'DIVISION' },
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
      { id: 'head-a', role: 'HEAD', departmentId: 'department-a', departmentType: 'DIVISION' },
    );

    expect(commissionCreate.mock.calls[0][0].data.departmentId)
      .toBe('department-at-approval');
  });
});
