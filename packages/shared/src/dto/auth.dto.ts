import { UserRole } from '../enums';

export interface LoginDto {
  account: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  user: {
    id: string;
    name: string;
    role: UserRole;
    departmentId?: string | null;
    avatar?: string | null;
  };
}
