import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DepartmentsService } from './departments.service';

describe('DepartmentsService', () => {
  it('拒绝把直属部门挂到市场部下面', async () => {
    const tx = {
      department: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'market-1',
          type: 'MARKET',
          status: 'ACTIVE',
          parentId: 'hq-1',
        }),
      },
    };
    const prisma = {
      $transaction: vi.fn((callback) => callback(tx)),
    };
    const service = new DepartmentsService(prisma as never);

    await expect(service.create(
      { name: '错误直属部门', type: 'DIRECT', parentId: 'market-1' },
      'admin-1',
    )).rejects.toBeInstanceOf(BadRequestException);
  });

  it('拒绝通过修改类型创建第八个市场部', async () => {
    const existing = {
      id: 'direct-1',
      name: '直属部门',
      code: null,
      type: 'DIRECT',
      parentId: 'hq-1',
      headId: null,
      status: 'ACTIVE',
      children: [],
    };
    const tx = {
      department: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'hq-1',
          type: 'HQ',
          status: 'ACTIVE',
          parentId: null,
        }),
        count: vi.fn().mockResolvedValue(7),
      },
    };
    const prisma = {
      department: { findUnique: vi.fn().mockResolvedValue(existing) },
      $transaction: vi.fn((callback) => callback(tx)),
    };
    const service = new DepartmentsService(prisma as never);

    await expect(service.update(
      'direct-1',
      { type: 'MARKET' },
      'admin-1',
    )).rejects.toBeInstanceOf(BadRequestException);
  });
});
