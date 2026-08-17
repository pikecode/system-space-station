import { DepartmentType } from './enums';

export const DEPARTMENT_TYPE_LABELS: Record<DepartmentType, string> = {
  [DepartmentType.GOVERNANCE]: '治理层',
  [DepartmentType.HQ]: '总经办',
  [DepartmentType.CENTER]: '中心',
  [DepartmentType.DIRECT]: '直属部门',
  [DepartmentType.MARKET]: '市场部',
  [DepartmentType.DIVISION]: '事业部',
};

export const DEPARTMENT_TYPE_COLORS: Record<DepartmentType, string> = {
  [DepartmentType.GOVERNANCE]: 'magenta',
  [DepartmentType.HQ]: 'red',
  [DepartmentType.CENTER]: 'purple',
  [DepartmentType.DIRECT]: 'blue',
  [DepartmentType.MARKET]: 'green',
  [DepartmentType.DIVISION]: 'orange',
};

export const VALID_PARENT_TYPES: Record<DepartmentType, DepartmentType[]> = {
  [DepartmentType.GOVERNANCE]: [DepartmentType.GOVERNANCE],
  [DepartmentType.HQ]: [DepartmentType.GOVERNANCE],
  [DepartmentType.CENTER]: [DepartmentType.HQ],
  [DepartmentType.DIRECT]: [DepartmentType.HQ, DepartmentType.CENTER],
  [DepartmentType.MARKET]: [DepartmentType.CENTER],
  [DepartmentType.DIVISION]: [DepartmentType.MARKET],
};

export const ALLOWED_CHILD_TYPES: Record<DepartmentType, DepartmentType[]> = {
  [DepartmentType.GOVERNANCE]: [DepartmentType.GOVERNANCE, DepartmentType.HQ],
  [DepartmentType.HQ]: [DepartmentType.CENTER, DepartmentType.DIRECT],
  [DepartmentType.CENTER]: [DepartmentType.DIRECT, DepartmentType.MARKET],
  [DepartmentType.DIRECT]: [],
  [DepartmentType.MARKET]: [DepartmentType.DIVISION],
  [DepartmentType.DIVISION]: [],
};

export const DEPARTMENT_CAPACITY: Partial<Record<DepartmentType, number>> = {
  [DepartmentType.MARKET]: 3,
  [DepartmentType.DIVISION]: 7,
};

export const MAX_MARKET_DEPARTMENTS = 7;

export function getDepartmentCapacity(type: DepartmentType | string | null | undefined): number | undefined {
  return type ? DEPARTMENT_CAPACITY[type as DepartmentType] : undefined;
}

export function canDepartmentGenerateShareCode(type: DepartmentType | string | null | undefined): boolean {
  return type === DepartmentType.MARKET || type === DepartmentType.DIVISION;
}
