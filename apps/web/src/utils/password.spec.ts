import { describe, expect, it } from 'vitest';
import { generateTemporaryPassword } from './password';

describe('generateTemporaryPassword', () => {
  it('生成包含大小写字母、数字和符号的随机密码', () => {
    const password = generateTemporaryPassword();

    expect(password).toHaveLength(12);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/\d/);
    expect(password).toMatch(/[!@#$%*\-_+]/);
  });

  it('连续生成的密码不应相同', () => {
    expect(generateTemporaryPassword()).not.toBe(generateTemporaryPassword());
  });
});
