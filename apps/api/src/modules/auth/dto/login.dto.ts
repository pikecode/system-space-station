import {
  IsMobilePhone,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @MaxLength(64)
  @IsOptional()
  account?: string;

  @IsMobilePhone('zh-CN')
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;
}

export class MiniAppLoginDto {
  @IsString()
  @MaxLength(32)
  employeeNo: string;

  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;
}

export class CustomerLoginDto {
  @IsString()
  @MaxLength(32)
  customerNo: string;

  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;
}

export class UnifiedMiniAppLoginDto {
  @IsString()
  @MaxLength(32)
  accountNo: string;

  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;
}
