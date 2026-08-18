import { UserRole } from '../enums';

export interface LoginDto {
  account: string;
  password: string;
}

export interface MiniAppLoginDto {
  employeeNo: string;
  password: string;
}

export interface CustomerLoginDto {
  customerNo: string;
  password: string;
}

export interface UnifiedMiniAppLoginDto {
  accountNo: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  user: {
    id: string;
    name: string;
    employeeNo?: string | null;
    role: UserRole;
    departmentId?: string | null;
    deptType?: string | null;
    department?: {
      id: string;
      name: string;
      type: string;
      parent?: {
        id: string;
        name: string;
        type: string;
      } | null;
    } | null;
    canWriteCustomer?: boolean;
    avatar?: string | null;
    shareCode?: string | null;
  };
}

export interface CustomerLoginResponseDto {
  token: string;
  customer: {
    id: string;
    customerNo: string;
    name: string;
    phone: string;
    status: string;
  };
}

export type UnifiedMiniAppLoginResponseDto =
  | (LoginResponseDto & { accountType: 'EMPLOYEE' })
  | (CustomerLoginResponseDto & { accountType: 'CUSTOMER' });
