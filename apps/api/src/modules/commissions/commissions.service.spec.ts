import { describe, expect, it, vi } from 'vitest';
import { CommissionsService } from './commissions.service';

describe('CommissionsService', () => {
  it('部门报表按审批时部门快照过滤', async () => {
    const count = vi.fn().mockResolvedValue(0);
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      $transaction: vi.fn().mockResolvedValue([0, []]),
      commissionRecord: { count, findMany },
    };
    const service = new CommissionsService(prisma as never);

    await service.findDepartment('department-a', {});

    expect(count.mock.calls[0][0].where).toEqual({ departmentId: 'department-a' });
    expect(findMany.mock.calls[0][0].where).toEqual({ departmentId: 'department-a' });
  });

  it('分成汇总由数据库按状态聚合', async () => {
    const groupBy = vi.fn().mockResolvedValue([
      { status: 'PENDING', _sum: { amount: { toString: () => '120.50' } } },
      { status: 'SETTLED', _sum: { amount: { toString: () => '300.00' } } },
    ]);
    const service = new CommissionsService({ commissionRecord: { groupBy } } as never);

    await expect(service.getSummary({ receiverUserId: 'user-1' })).resolves.toEqual({
      pending: '120.50',
      pendingPayment: '0',
      settled: '300.00',
    });
    expect(groupBy.mock.calls[0][0].where).toEqual({ receiverUserId: 'user-1' });
  });
});
