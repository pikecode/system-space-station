import { UserRole } from '../enums';

export interface LoginDto {
  phone: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  user: {
    id: string;
    name: string;
    role: UserRole;
    departmentId?: string;
    avatar?: string;
  };
}
