import {
  IsDateString,
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
  IsMobilePhone,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Gender, UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  name: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsString()
  @Matches(/^[a-z][a-z0-9_.-]{2,31}$/, {
    message: '用户名必须以字母开头，由3-32位字母、数字、点、下划线或短横线组成',
  })
  @IsOptional()
  username?: string;

  @IsMobilePhone('zh-CN')
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  positionId?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @IsString()
  @MaxLength(32)
  @IsOptional()
  employeeNo?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ValidateIf((_object, value) => value !== '')
  @IsMobilePhone('zh-CN')
  @IsOptional()
  alternatePhone?: string;

  @IsString()
  @MaxLength(64)
  @IsOptional()
  wechat?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  province?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  city?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  district?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  addressDetail?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @Matches(/^\d{17}[\dX]$/, { message: '身份证号码格式不正确' })
  @IsOptional()
  idCardNo?: string;

  @ValidateIf((_object, value) => value !== '')
  @IsEmail()
  @IsOptional()
  email?: string;
}
