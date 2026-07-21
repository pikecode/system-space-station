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
});
