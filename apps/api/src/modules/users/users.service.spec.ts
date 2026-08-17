import { describe, expect, it, vi } from 'vitest';
import { UserStatus, UserType } from '@prisma/client';
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

  it('调岗进入满员市场部时拒绝（无论原来是否有编号）', async () => {
    const tx = {
      department: {
        findUnique: vi.fn().mockResolvedValue({ id: 'market-1', type: 'MARKET', status: 'ACTIVE' }),
      },
      user: {
        count: vi.fn().mockResolvedValue(3),
      },
    };
    const prisma = {
      user: { findFirst: vi.fn().mockResolvedValue(null) },
      $transaction: vi.fn((callback: (transactionClient: typeof tx) => unknown) => callback(tx)),
    };
    const service = new UsersService(prisma as never, {} as never);
    // 即使原来没有编号，调入管控部门也必须校验容量
    vi.spyOn(service, 'findOne').mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
      userType: UserType.EMPLOYEE,
      employeeNo: null,
      departmentId: 'dept-old',
      headOf: null,
    } as never);

    await expect(
      service.transfer('member-1', { newDepartmentId: 'market-1', newRole: 'MEMBER' }, 'admin-1'),
    ).rejects.toThrow('市场部（1+2模式，上限3人）已满员，无法继续加入');
    expect(tx.user.count).toHaveBeenCalledWith({
      where: { departmentId: 'market-1', status: 'ACTIVE', employeeNo: { not: null } },
    });
  });

  it('调岗离开事业部时编号被清空（槽位归还部门）', async () => {
    const tx = {
      department: {
        // target = CENTER（非管控）
        findUnique: vi.fn()
          .mockResolvedValueOnce({ id: 'center-1', type: 'CENTER', status: 'ACTIVE', code: null })
          // source dept lookup
          .mockResolvedValueOnce({ type: 'DIVISION' }),
      },
      user: {
        update: vi.fn().mockResolvedValue({
          id: 'member-1', role: 'MEMBER', status: 'ACTIVE', employeeNo: null, departmentId: 'center-1',
        }),
        findUnique: vi.fn().mockResolvedValue(null),
      },
      customer: { updateMany: vi.fn() },
      auditLog: { create: vi.fn() },
    };
    const prisma = {
      $transaction: vi.fn((callback: (transactionClient: typeof tx) => unknown) => callback(tx)),
    };
    const service = new UsersService(prisma as never, {} as never);
    vi.spyOn(service, 'findOne').mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
      status: 'ACTIVE',
      employeeNo: 'DIV020103',
      departmentId: 'dept-div-1',
      headOf: null,
    } as never);

    await service.transfer('member-1', { newDepartmentId: 'center-1', newRole: 'MEMBER' }, 'admin-1');

    expect(tx.user.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ employeeNo: null }),
    }));
  });

  it('有编号的合伙人必须设置密码', async () => {
    const service = new UsersService({} as never, {} as never);

    await expect(
      service.create({
        name: '事业合伙人',
        phone: '13800000009',
        userType: UserType.PARTNER,
        employeeNo: 'DIV020103',
        role: 'MEMBER',
        departmentId: 'dept-div-1',
      }, 'admin-1'),
    ).rejects.toThrow('有编号的合伙人必须设置密码');
  });

  it('市场部新增人员未填编号时自动生成最小空号', async () => {
    const tx = {
      department: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'market-1',
          type: 'MARKET',
          status: 'ACTIVE',
          code: 'MKT02',
        }),
        updateMany: vi.fn(),
      },
      user: {
        findMany: vi.fn().mockResolvedValue([{ employeeNo: 'MKT0201' }]),
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue(null),
        count: vi.fn().mockResolvedValue(1),
        create: vi.fn().mockResolvedValue({
          id: 'member-2',
          name: '市场成员',
          username: null,
          phone: '13800000010',
          employeeNo: 'MKT0202',
          role: 'MEMBER',
          status: 'ACTIVE',
          departmentId: 'market-1',
          positionId: null,
        }),
      },
      auditLog: { create: vi.fn() },
    };
    const prisma = {
      user: { findFirst: vi.fn().mockResolvedValue(null) },
      $transaction: vi.fn((callback: (transactionClient: typeof tx) => unknown) => callback(tx)),
    };
    const service = new UsersService(prisma as never, {} as never);

    await service.create({
      name: '市场成员',
      phone: '13800000010',
      role: 'MEMBER',
      departmentId: 'market-1',
      password: 'Test123456',
    }, 'admin-1');

    expect(tx.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ employeeNo: 'MKT0202' }),
    }));
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

  it('禁用管控部门（MARKET/DIVISION）人员时自动释放槽位编号', async () => {
    const tx = {
      user: {
        update: vi.fn().mockResolvedValue({
          id: 'member-1',
          role: 'MEMBER',
          status: 'INACTIVE',
          employeeNo: null,
        }),
      },
      auditLog: { create: vi.fn() },
    };
    const prisma = {
      $transaction: vi.fn((callback: (transactionClient: typeof tx) => unknown) => callback(tx)),
    };
    const service = new UsersService(prisma as never, {} as never);
    vi.spyOn(service, 'findOne').mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
      status: 'ACTIVE',
      employeeNo: 'DIV020103',
      departmentId: 'dept-div-1',
      department: { id: 'dept-div-1', name: '事业1部', type: 'DIVISION' },
      headOf: null,
    } as never);

    await service.setStatus('member-1', UserStatus.INACTIVE, undefined, 'admin-1');

    expect(tx.user.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        status: UserStatus.INACTIVE,
        employeeNo: null,
        authVersion: { increment: 1 },
      }),
    }));
  });

  it('禁用非管控部门人员时不传 releaseEmployeeNo 则保留编号', async () => {
    const tx = {
      user: {
        update: vi.fn().mockResolvedValue({
          id: 'member-1',
          role: 'MEMBER',
          status: 'INACTIVE',
          employeeNo: 'DEV101',
        }),
      },
      auditLog: { create: vi.fn() },
    };
    const prisma = {
      $transaction: vi.fn((callback: (transactionClient: typeof tx) => unknown) => callback(tx)),
    };
    const service = new UsersService(prisma as never, {} as never);
    vi.spyOn(service, 'findOne').mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
      status: 'ACTIVE',
      employeeNo: 'DEV101',
      departmentId: 'dept-dev',
      department: { id: 'dept-dev', name: '数据应用处', type: 'DIRECT' },
      headOf: null,
    } as never);

    await service.setStatus('member-1', UserStatus.INACTIVE, undefined, 'admin-1');

    const callData = tx.user.update.mock.calls[0][0].data;
    expect(callData.employeeNo).toBeUndefined();
  });
});
