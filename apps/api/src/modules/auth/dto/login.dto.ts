import { IsString, IsMobilePhone, MinLength } from 'class-validator';

export class LoginDto {
  @IsMobilePhone('zh-CN')
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;
}
