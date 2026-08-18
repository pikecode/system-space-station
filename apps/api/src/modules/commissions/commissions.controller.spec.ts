import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { CommissionsController } from './commissions.controller';

const service = {
  findMy: vi.fn(),
  getSummary: vi.fn(),
  findDepartment: vi.fn(),
  findOverview: vi.fn(),
  getPeriods: vi.fn(),
  settle: vi.fn(),
};

describe('CommissionsController', () => {
  it('发展中心账号不能查看个人分成明细', () => {
    const controller = new CommissionsController(service as never);
    const user = {
      id: 'dev-user-1',
      role: 'HEAD',
      departmentId: 'dev-center',
      departmentType: 'CENTER',
      departmentName: '发展中心',
    };

    expect(() => controller.findMy(user, {})).toThrow(ForbiddenException);
  });

  it('服务中心账号不能查看部门分成明细', () => {
    const controller = new CommissionsController(service as never);
    const user = {
      id: 'svc-user-1',
      role: 'HEAD',
      departmentId: 'svc-center',
      departmentType: 'CENTER',
      departmentName: '服务中心',
    };

    expect(() => controller.findDepartment(user, {})).toThrow(ForbiddenException);
  });

  it('营销中心负责人可以查看部门分成明细', () => {
    const controller = new CommissionsController(service as never);
    const user = {
      id: 'mkt-user-1',
      role: 'HEAD',
      departmentId: 'mkt-center',
      departmentType: 'CENTER',
      departmentName: '营销中心',
    };

    controller.findDepartment(user, {});

    expect(service.findDepartment).toHaveBeenCalledWith('mkt-center', {});
  });
});
