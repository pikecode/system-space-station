import { describe, expect, it, vi } from 'vitest';
import { UsersService } from './users.service';

describe('UsersService', () => {
  it('用户列表查询不会选择密码哈希和令牌版本', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const service = new UsersService(
      { user: { findMany } } as never,
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
  });
});
