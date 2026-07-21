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
