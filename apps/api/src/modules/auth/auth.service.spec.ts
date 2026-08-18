import * as bcrypt from 'bcrypt';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';

async function createFixture() {
  const passwordHash = await bcrypt.hash('Admin123456', 4);
  const findFirst = vi.fn().mockResolvedValue({
    id: 'admin-1',
    name: '系统管理员',
    username: 'admin',
    phone: '13800000000',
    role: 'ADMIN',
    departmentId: null,
    authVersion: 1,
    status: 'ACTIVE',
    avatar: null,
    passwordHash,
  });
  const findUnique = vi.fn();
  const findUniqueCustomer = vi.fn();
  const updateCustomer = vi.fn();
  const findUniqueDepartment = vi.fn();
  const update = vi.fn();
  const sign = vi.fn().mockReturnValue('jwt-token');
  const service = new AuthService(
    {
      user: { findFirst, findUnique, update },
      customer: { findUnique: findUniqueCustomer, update: updateCustomer },
      department: { findUnique: findUniqueDepartment },
    } as never,
    { sign } as never,
    { getOrThrow: vi.fn() } as never,
  );
  return { service, findFirst, findUnique, findUniqueCustomer, findUniqueDepartment, update, updateCustomer, passwordHash, sign };
}

describe('AuthService', () => {
  it('管理员可以使用用户名和密码登录', async () => {
    const { service, findFirst } = await createFixture();

    const response = await service.login({ account: 'Admin', password: 'Admin123456' });

    expect(response.token).toBe('jwt-token');
    expect(findFirst.mock.calls[0][0].where.OR).toContainEqual({ username: 'admin' });
  });

  it('兼容旧客户端使用手机号字段登录', async () => {
    const { service, findFirst } = await createFixture();

    await service.login({ phone: '13800000000', password: 'Admin123456' });

    expect(findFirst.mock.calls[0][0].where.OR).toContainEqual({ phone: '13800000000' });
  });

  it('小程序允许营销体系人员使用编号和密码登录', async () => {
    const { service, findUnique, update } = await createFixture();
    findUnique.mockResolvedValue({
      id: 'user-1',
      name: '营销人员',
      employeeNo: 'YX0001',
      role: 'MEMBER',
      departmentId: 'dept-1',
      authVersion: 1,
      status: 'ACTIVE',
      avatar: null,
      shareCode: 'ABC123',
      passwordHash: await bcrypt.hash('User123456', 4),
      department: { id: 'dept-1', name: '营销一部', type: 'MARKET', status: 'ACTIVE', parentId: null },
    });

    const response = await service.miniAppLogin({ employeeNo: ' yx0001 ', password: 'User123456' });

    expect(response.token).toBe('jwt-token');
    expect(response.user.employeeNo).toBe('YX0001');
    expect(response.user.canWriteCustomer).toBe(true);
    expect(findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { employeeNo: 'YX0001' } }));
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'user-1' },
      data: expect.objectContaining({ lastLoginAt: expect.any(Date) }),
    }));
  });

  it('小程序拒绝非授权中心人员登录', async () => {
    const { service, findUnique } = await createFixture();
    findUnique.mockResolvedValue({
      id: 'user-2',
      name: '总部人员',
      employeeNo: 'HQ0001',
      role: 'MEMBER',
      departmentId: 'dept-2',
      authVersion: 1,
      status: 'ACTIVE',
      avatar: null,
      shareCode: null,
      passwordHash: await bcrypt.hash('User123456', 4),
      department: { id: 'dept-2', name: '总经办', type: 'HQ', status: 'ACTIVE', parentId: null },
    });

    await expect(
      service.miniAppLogin({ employeeNo: 'HQ0001', password: 'User123456' }),
    ).rejects.toThrow('当前账号无小程序登录权限');
  });

  it('发展中心负责人登录后仍然没有客户写权限', async () => {
    const { service, findUnique } = await createFixture();
    findUnique.mockResolvedValue({
      id: 'user-dev-head',
      name: '发展负责人',
      employeeNo: 'DEV0001',
      role: 'HEAD',
      departmentId: 'dept-dev',
      authVersion: 1,
      status: 'ACTIVE',
      avatar: null,
      shareCode: null,
      passwordHash: await bcrypt.hash('User123456', 4),
      department: { id: 'dept-dev', name: '发展中心', type: 'CENTER', status: 'ACTIVE', parentId: null },
    });

    const response = await service.miniAppLogin({ employeeNo: 'DEV0001', password: 'User123456' });

    expect(response.user.canWriteCustomer).toBe(false);
  });

  it('服务中心负责人登录后仍然没有客户写权限', async () => {
    const { service, findUnique } = await createFixture();
    findUnique.mockResolvedValue({
      id: 'user-svc-head',
      name: '服务负责人',
      employeeNo: 'SVC0001',
      role: 'HEAD',
      departmentId: 'dept-svc',
      authVersion: 1,
      status: 'ACTIVE',
      avatar: null,
      shareCode: null,
      passwordHash: await bcrypt.hash('User123456', 4),
      department: { id: 'dept-svc', name: '服务中心', type: 'CENTER', status: 'ACTIVE', parentId: null },
    });

    const response = await service.miniAppLogin({ employeeNo: 'SVC0001', password: 'User123456' });

    expect(response.user.canWriteCustomer).toBe(false);
  });

  it('小程序允许授权中心下属部门人员登录', async () => {
    const { service, findUnique, findUniqueDepartment } = await createFixture();
    findUnique.mockResolvedValue({
      id: 'user-3',
      name: '服务专员',
      employeeNo: 'FW0001',
      role: 'MEMBER',
      departmentId: 'dept-3',
      authVersion: 1,
      status: 'ACTIVE',
      avatar: null,
      shareCode: null,
      passwordHash: await bcrypt.hash('User123456', 4),
      department: {
        id: 'dept-3',
        name: '客户服务组',
        type: 'DIRECT',
        status: 'ACTIVE',
        parentId: 'center-1',
        parent: { id: 'center-1', name: '服务中心', type: 'CENTER', status: 'ACTIVE' },
      },
    });
    findUniqueDepartment.mockResolvedValue({
      id: 'center-1',
      name: '服务中心',
      type: 'CENTER',
      status: 'ACTIVE',
      parentId: null,
    });

    const response = await service.miniAppLogin({ employeeNo: 'FW0001', password: 'User123456' });

    expect(response.user.departmentId).toBe('dept-3');
    expect(response.user.department?.parent?.name).toBe('服务中心');
    expect(response.user.canWriteCustomer).toBe(false);
    expect(findUniqueDepartment).not.toHaveBeenCalled();
  });

  it('小程序拒绝父级中心已停用的直属部门人员登录', async () => {
    const { service, findUnique, findUniqueDepartment } = await createFixture();
    findUnique.mockResolvedValue({
      id: 'user-4',
      name: '服务专员',
      employeeNo: 'FW0002',
      role: 'MEMBER',
      departmentId: 'dept-4',
      authVersion: 1,
      status: 'ACTIVE',
      avatar: null,
      shareCode: null,
      passwordHash: await bcrypt.hash('User123456', 4),
      department: {
        id: 'dept-4',
        name: '客户服务组',
        type: 'DIRECT',
        status: 'ACTIVE',
        parentId: 'center-2',
        parent: { id: 'center-2', name: '服务中心', type: 'CENTER', status: 'INACTIVE' },
      },
    });
    findUniqueDepartment.mockResolvedValue({
      id: 'center-2',
      name: '服务中心',
      type: 'CENTER',
      status: 'INACTIVE',
      parentId: null,
    });

    await expect(
      service.miniAppLogin({ employeeNo: 'FW0002', password: 'User123456' }),
    ).rejects.toThrow('当前账号无小程序登录权限');
  });

  it('正式会员可以使用客户编号和密码登录', async () => {
    const { service, findUniqueCustomer, updateCustomer, sign } = await createFixture();
    findUniqueCustomer.mockResolvedValue({
      id: 'customer-1',
      name: '客户甲',
      phone: '13800000000',
      customerNo: 'C202608000001',
      status: 'ACTIVE_MEMBER',
      customerPasswordHash: await bcrypt.hash('000000', 4),
    });

    const response = await service.customerLogin({
      customerNo: ' c202608000001 ',
      password: '000000',
    });

    expect(response.token).toBe('jwt-token');
    expect(response.customer.customerNo).toBe('C202608000001');
    expect(findUniqueCustomer).toHaveBeenCalledWith(expect.objectContaining({
      where: { customerNo: 'C202608000001' },
    }));
    expect(updateCustomer).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'customer-1' },
      data: expect.objectContaining({ customerLastLoginAt: expect.any(Date) }),
    }));
    expect(sign).toHaveBeenCalledWith(expect.objectContaining({
      subjectType: 'CUSTOMER',
      sub: 'customer-1',
      customerNo: 'C202608000001',
    }));
  });

  it('小程序统一登录可自动识别客户编号', async () => {
    const { service, findUniqueCustomer, updateCustomer } = await createFixture();
    findUniqueCustomer.mockResolvedValue({
      id: 'customer-1',
      name: '客户甲',
      phone: '13800000000',
      customerNo: 'C202608000001',
      status: 'ACTIVE_MEMBER',
      customerPasswordHash: await bcrypt.hash('000000', 4),
    });

    const response = await service.unifiedMiniAppLogin({
      accountNo: ' c202608000001 ',
      password: '000000',
    });

    expect(response.accountType).toBe('CUSTOMER');
    if (response.accountType !== 'CUSTOMER') throw new Error('expected customer login response');
    expect(response.customer.customerNo).toBe('C202608000001');
    expect(updateCustomer).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'customer-1' },
      data: expect.objectContaining({ customerLastLoginAt: expect.any(Date) }),
    }));
  });

  it('小程序统一登录找不到客户编号时自动按员工编号登录', async () => {
    const { service, findUnique, findUniqueCustomer } = await createFixture();
    findUniqueCustomer.mockResolvedValue(null);
    findUnique.mockResolvedValue({
      id: 'user-1',
      name: '营销人员',
      employeeNo: 'YX0001',
      role: 'MEMBER',
      departmentId: 'dept-1',
      authVersion: 1,
      status: 'ACTIVE',
      avatar: null,
      shareCode: 'ABC123',
      passwordHash: await bcrypt.hash('User123456', 4),
      department: { id: 'dept-1', name: '营销一部', type: 'MARKET', status: 'ACTIVE', parentId: null },
    });

    const response = await service.unifiedMiniAppLogin({
      accountNo: 'yx0001',
      password: 'User123456',
    });

    expect(response.accountType).toBe('EMPLOYEE');
    if (response.accountType !== 'EMPLOYEE') throw new Error('expected employee login response');
    expect(response.user.employeeNo).toBe('YX0001');
  });

  it('意向客户不能使用客户编号登录', async () => {
    const { service, findUniqueCustomer } = await createFixture();
    findUniqueCustomer.mockResolvedValue({
      id: 'customer-1',
      name: '客户甲',
      phone: '13800000000',
      customerNo: 'C202608000001',
      status: 'PROSPECT',
      customerPasswordHash: await bcrypt.hash('000000', 4),
    });

    await expect(service.customerLogin({
      customerNo: 'C202608000001',
      password: '000000',
    })).rejects.toThrow('客户账号未激活');
  });
});
