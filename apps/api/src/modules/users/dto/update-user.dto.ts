import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  IsMobilePhone,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsMobilePhone('zh-CN')
  @IsOptional()
  phone?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  positionId?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  newPassword?: string;
}
