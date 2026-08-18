import { describe, expect, it } from 'vitest';
import { resolveDataScope } from './data-scope';

describe('resolveDataScope', () => {
  it('发展中心负责人仍然是全量只读', () => {
    expect(resolveDataScope({
      id: 'user-1',
      role: 'HEAD',
      departmentId: 'dept-dev',
      departmentType: 'CENTER',
      departmentName: '发展中心',
    })).toEqual({ type: 'ALL_READONLY' });
  });

  it('只有营销中心负责人是全量可写', () => {
    expect(resolveDataScope({
      id: 'user-2',
      role: 'HEAD',
      departmentId: 'dept-mkt',
      departmentType: 'CENTER',
      departmentName: '营销中心',
    })).toEqual({ type: 'ALL_WRITABLE' });
  });

  it('授权中心下属直属部门可登录但数据权限只读', () => {
    expect(resolveDataScope({
      id: 'user-3',
      role: 'HEAD',
      departmentId: 'dept-dev-direct',
      departmentType: 'DIRECT',
      departmentName: '标准制定处',
      parentDepartmentType: 'CENTER',
      parentDepartmentName: '发展中心',
    })).toEqual({ type: 'ALL_READONLY' });
  });
});
