import { UserRole } from '../enums';

export interface LoginDto {
  account: string;
  password: string;
}

export interface MiniAppLoginDto {
  employeeNo: string;
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
    department?: {
      id: string;
      name: string;
      type: string;
    } | null;
    avatar?: string | null;
    shareCode?: string | null;
  };
}
