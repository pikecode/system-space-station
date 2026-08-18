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
  const findUniqueDepartment = vi.fn();
  const update = vi.fn();
  const sign = vi.fn().mockReturnValue('jwt-token');
  const service = new AuthService(
    {
      user: { findFirst, findUnique, update },
      department: { findUnique: findUniqueDepartment },
    } as never,
    { sign } as never,
    { getOrThrow: vi.fn() } as never,
  );
  return { service, findFirst, findUnique, findUniqueDepartment, update, passwordHash };
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
});
