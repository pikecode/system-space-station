import { DepartmentType } from '@prisma/client';

export type DataScopeType =
  | 'SELF'          // 只看自己的客户
  | 'DEPARTMENT'    // 本部门所有客户（事业部 HEAD）
  | 'MARKET_TREE'   // 市场部 + 下属所有事业部（市场部人员）
  | 'ALL_READONLY'  // 全量只读（发展/服务中心）
  | 'ALL_WRITABLE'; // 全量可读写（营销中心 HEAD）

export interface DataScope {
  type: DataScopeType;
  userId?: string;
  departmentId?: string;
  marketDeptId?: string;
}

export function resolveDataScope(currentUser: {
  id: string;
  role: string;
  departmentId?: string | null;
  departmentType?: string | null;
}): DataScope {
  const { id, role, departmentId, departmentType } = currentUser;

  // 系统管理员走旧逻辑（web 端）
  if (role === 'ADMIN') return { type: 'ALL_WRITABLE' };

  switch (departmentType) {
    case DepartmentType.DIVISION:
      if (role === 'HEAD') return { type: 'DEPARTMENT', departmentId: departmentId ?? undefined };
      return { type: 'SELF', userId: id };

    case DepartmentType.MARKET:
      // 市场部无普通成员，均可见本部门 + 下属事业部
      return { type: 'MARKET_TREE', marketDeptId: departmentId ?? undefined };

    case DepartmentType.CENTER:
      // 营销中心 HEAD 可写，其他只读
      if (role === 'HEAD') return { type: 'ALL_WRITABLE' };
      return { type: 'ALL_READONLY' };

    default:
      // 其他部门（HQ/DIRECT/GOVERNANCE）退化为只看自己
      return { type: 'SELF', userId: id };
  }
}

export function canWrite(scope: DataScope): boolean {
  return scope.type === 'ALL_WRITABLE' || scope.type === 'MARKET_TREE' || scope.type === 'DEPARTMENT' || scope.type === 'SELF';
}
