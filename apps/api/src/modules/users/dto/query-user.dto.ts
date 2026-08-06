import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole, UserStatus, UserType } from '@prisma/client';

export class QueryUserDto {
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
  @IsOptional() @IsEnum(UserRole) excludeRole?: UserRole;
  @IsOptional() @IsEnum(UserStatus) status?: UserStatus;
  @IsOptional() @IsString() employeeNo?: string;
  @IsOptional() @IsString() username?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEnum(UserType) userType?: UserType;
  @IsOptional() @IsString() page?: string;
  @IsOptional() @IsString() pageSize?: string;
}
