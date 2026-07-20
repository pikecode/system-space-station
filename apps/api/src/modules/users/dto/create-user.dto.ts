import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  IsMobilePhone,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsMobilePhone('zh-CN')
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  positionId?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
