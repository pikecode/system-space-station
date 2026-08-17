import { describe, expect, it, vi } from 'vitest';
import { UserStatus } from '@prisma/client';
import { UsersService } from './users.service';

describe('UsersService', () => {
  it('用户列表查询不会选择密码哈希和令牌版本', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const transaction = vi.fn().mockResolvedValue([0, []]);
    const service = new UsersService(
      { user: { count, findMany }, $transaction: transaction } as never,
      {} as never,
    );

    await service.findAll({});

    const select = findMany.mock.calls[0][0].select;
    expect(select.passwordHash).toBeUndefined();
    expect(select.authVersion).toBeUndefined();
    expect(select.idCardEncrypted).toBeUndefined();
    expect(select.idCardHash).toBeUndefined();
    expect(select.idCardMasked).toBe(true);
    expect(select.phone).toBe(true);
    expect(findMany.mock.calls[0][0].skip).toBe(0);
    expect(findMany.mock.calls[0][0].take).toBe(20);
  });

  it('用户列表对非法分页参数使用默认值', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const transaction = vi.fn().mockResolvedValue([0, []]);
    const service = new UsersService(
      { user: { count: vi.fn(), findMany }, $transaction: transaction } as never,
      {} as never,
    );

    await service.findAll({ page: 'invalid', pageSize: '0' });

    expect(findMany.mock.calls[0][0].skip).toBe(0);
    expect(findMany.mock.calls[0][0].take).toBe(20);
  });

  it('不能禁用当前登录的管理员', async () => {
    const service = new UsersService({} as never, {} as never);
    vi.spyOn(service, 'findOne').mockResolvedValue({ id: 'admin-1', role: 'ADMIN' } as never);

    await expect(
      service.setStatus('admin-1', UserStatus.INACTIVE, undefined, 'admin-1'),
    ).rejects.toThrow('不能禁用当前登录的管理员账号');
  });

  it('不能禁用最后一个有效管理员', async () => {
    const transactionClient = {
      $executeRaw: vi.fn(),
      user: { count: vi.fn().mockResolvedValue(1) },
    };
    const prisma = {
      $transaction: vi.fn((callback: (tx: typeof transactionClient) => unknown) => callback(transactionClient)),
    };
    const service = new UsersService(prisma as never, {} as never);
    vi.spyOn(service, 'findOne').mockResolvedValue({ id: 'admin-2', role: 'ADMIN' } as never);

    await expect(
      service.setStatus('admin-2', UserStatus.INACTIVE, undefined, 'admin-1'),
    ).rejects.toThrow('至少需要保留一个启用状态的系统管理员');
  });

  it('系统管理员不能通过调岗进入业务部门', async () => {
    const service = new UsersService({} as never, {} as never);
    vi.spyOn(service, 'findOne').mockResolvedValue({ id: 'admin-2', role: 'ADMIN' } as never);

    await expect(
      service.transfer('admin-2', { newDepartmentId: 'dept-1', newRole: 'MEMBER' }, 'admin-1'),
    ).rejects.toThrow('系统管理员不能加入业务部门');
  });

  it('调岗进入满员市场部时拒绝', async () => {
    const tx = {
      department: {
        findUnique: vi.fn().mockResolvedValue({ id: 'market-1', type: 'MARKET', status: 'ACTIVE' }),
      },
      user: {
        count: vi.fn().mockResolvedValue(3),
      },
    };
    const prisma = {
      $transaction: vi.fn((callback: (transactionClient: typeof tx) => unknown) => callback(tx)),
    };
    const service = new UsersService(prisma as never, {} as never);
    vi.spyOn(service, 'findOne').mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
      departmentId: 'dept-old',
      headOf: null,
    } as never);

    await expect(
      service.transfer('member-1', { newDepartmentId: 'market-1', newRole: 'MEMBER' }, 'admin-1'),
    ).rejects.toThrow('市场部（1+2模式，上限3人）已满员，无法继续加入');
  });

  it('名下仍有客户时不能直接移出部门', async () => {
    const service = new UsersService({
      customer: { count: vi.fn().mockResolvedValue(1) },
    } as never, {} as never);
    vi.spyOn(service, 'findOne').mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
      departmentId: 'dept-1',
      headOf: null,
    } as never);

    await expect(
      service.removeFromDepartment('member-1', 'admin-1'),
    ).rejects.toThrow('该用户名下仍有客户，请先调岗或转移客户');
  });
});
