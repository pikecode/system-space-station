import { UserRole, UserStatus } from '../enums';
import type { PaginationQuery } from './common.dto';

export interface QueryUsersDto extends PaginationQuery {
  departmentId?: string;
  role?: UserRole | string;
  excludeRole?: UserRole | string;
  status?: UserStatus | string;
  employeeNo?: string;
  username?: string;
  name?: string;
  phone?: string;
  userType?: string;
}

export interface UserOptionDto {
  id: string;
  name: string;
  phone?: string;
  role?: UserRole | string;
  userType?: string;
  departmentId?: string | null;
  status?: UserStatus | string;
}
