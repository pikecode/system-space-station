import { describe, expect, it, vi } from 'vitest';
import { CustomersService } from './customers.service';

describe('CustomersService', () => {
  it('后台成员新增客户时默认归属当前登录人', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 'member-1',
      departmentId: 'dept-1',
      status: 'ACTIVE',
    });
    const create = vi.fn().mockImplementation(({ data }) => Promise.resolve(data));
    const service = new CustomersService({
      user: { findUnique },
      customer: { create },
    } as never);

    await service.create({
      customerType: 'INDIVIDUAL',
      name: '测试客户',
      phone: '13800000000',
    } as never, { id: 'member-1', role: 'MEMBER' });

    expect(create.mock.calls[0][0].data).toMatchObject({
      assignedTo: 'member-1',
      departmentId: 'dept-1',
      createdBy: 'member-1',
      referredBy: null,
      registrationSource: 'SELF',
    });
  });
});
