import { describe, expect, it, vi } from 'vitest';
import { CustomersService } from './customers.service';

describe('CustomersService', () => {
  it('发展中心负责人只能查看，不能新增客户', async () => {
    const service = new CustomersService({} as never);

    await expect(
      service.create({
        customerType: 'INDIVIDUAL',
        name: '测试客户',
        phone: '13800000000',
      } as never, {
        id: 'dev-head',
        role: 'HEAD',
        departmentId: 'dept-dev',
        departmentType: 'CENTER',
        departmentName: '发展中心',
      }),
    ).rejects.toThrow('当前角色仅有查看权限，无法新增客户');
  });

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

  it('查询意向客户时兼容历史 ACTIVE 状态', async () => {
    const service = new CustomersService({
      $transaction: vi.fn().mockResolvedValue([0, []]),
      customer: {
        count: vi.fn(),
        findMany: vi.fn(),
      },
    } as never);

    await service.findAll({ id: 'admin-1', role: 'ADMIN' }, {
      status: 'PROSPECT',
      page: '1',
      pageSize: '20',
    } as never);

    expect((service as any).prisma.customer.count).toHaveBeenCalledWith({
      where: { status: { in: ['PROSPECT', 'ACTIVE'] } },
    });
  });

  it('客户资产接口一次返回投资、佣金和收益明细', async () => {
    const investment = { id: 'investment-1', amount: 100000 };
    const investmentCommission = { id: 'commission-1', investmentId: 'investment-1' };
    const profitRecord = { id: 'profit-1', customerId: 'customer-1' };
    const service = new CustomersService({
      customer: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'customer-1',
          assignedTo: 'admin-1',
          departmentId: 'dept-1',
        }),
      },
      customerInvestment: {
        findMany: vi.fn().mockResolvedValue([investment]),
      },
      investmentCommissionRecord: {
        findMany: vi.fn().mockResolvedValue([investmentCommission]),
      },
      customerProfitRecord: {
        findMany: vi.fn().mockResolvedValue([profitRecord]),
      },
      $transaction: vi.fn((queries) => Promise.all(queries)),
    } as never);

    const result = await service.getAssets('customer-1', { id: 'admin-1', role: 'ADMIN' });

    expect(result.investments).toEqual([investment]);
    expect(result.investmentCommissions).toEqual([investmentCommission]);
    expect(result.profitRecords).toEqual([profitRecord]);
  });

  it('正式会员可重置客户登录密码并返回初始密码', async () => {
    const update = vi.fn().mockResolvedValue({});
    const service = new CustomersService({
      customer: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'customer-1',
          status: 'ACTIVE_MEMBER',
          phone: '13800008888',
          customerNo: 'C202608000001',
          assignedTo: 'admin-1',
          departmentId: 'dept-1',
        }),
        update,
      },
    } as never);

    const result = await service.resetPassword('customer-1', { id: 'admin-1', role: 'ADMIN' });

    expect(result).toEqual({
      customerNo: 'C202608000001',
      initialPassword: '008888',
    });
    expect(update.mock.calls[0][0]).toMatchObject({
      where: { id: 'customer-1' },
      data: { customerPasswordHash: expect.any(String) },
    });
  });

  it('停用客户恢复时有投资则恢复为正式会员', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'customer-1', status: 'ACTIVE_MEMBER' });
    const service = new CustomersService({
      customer: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'customer-1',
          status: 'INACTIVE',
          assignedTo: 'admin-1',
          departmentId: 'dept-1',
        }),
        update,
      },
      customerInvestment: {
        count: vi.fn().mockResolvedValue(1),
      },
    } as never);

    await service.restore('customer-1', { id: 'admin-1', role: 'ADMIN' });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'customer-1' },
      data: { status: 'ACTIVE_MEMBER' },
    });
  });

  it('停用客户恢复时无投资则恢复为意向客户', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'customer-1', status: 'PROSPECT' });
    const service = new CustomersService({
      customer: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'customer-1',
          status: 'INACTIVE',
          assignedTo: 'admin-1',
          departmentId: 'dept-1',
        }),
        update,
      },
      customerInvestment: {
        count: vi.fn().mockResolvedValue(0),
      },
    } as never);

    await service.restore('customer-1', { id: 'admin-1', role: 'ADMIN' });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'customer-1' },
      data: { status: 'PROSPECT' },
    });
  });
});
