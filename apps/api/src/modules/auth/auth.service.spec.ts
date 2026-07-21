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
  const sign = vi.fn().mockReturnValue('jwt-token');
  const service = new AuthService(
    { user: { findFirst } } as never,
    { sign } as never,
  );
  return { service, findFirst };
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
});
