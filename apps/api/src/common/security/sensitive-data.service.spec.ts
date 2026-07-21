import { describe, expect, it } from 'vitest';
import { SensitiveDataService } from './sensitive-data.service';

const KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

describe('SensitiveDataService', () => {
  it('身份证使用随机密文存储并生成稳定指纹和掩码', () => {
    const service = new SensitiveDataService({
      getOrThrow: () => KEY,
    } as never);

    const first = service.protectIdentityCard('44010119900101123x');
    const second = service.protectIdentityCard('44010119900101123X');

    expect(first.encrypted).not.toContain('44010119900101123X');
    expect(first.encrypted).not.toBe(second.encrypted);
    expect(first.hash).toBe(second.hash);
    expect(first.masked).toBe('4401**********123X');
    expect(service.decryptIdentityCard(first.encrypted)).toBe('44010119900101123X');
  });
});
