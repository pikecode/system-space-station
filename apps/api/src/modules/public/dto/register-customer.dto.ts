import { IsEnum, IsMobilePhone, IsOptional, IsString, MaxLength } from 'class-validator';
import { CustomerType } from '@prisma/client';

export class PublicRegisterDto {
  @IsString()
  shareCode: string;

  @IsEnum(CustomerType)
  customerType: CustomerType;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsMobilePhone('zh-CN')
  phone: string;

  @IsString()
  @MaxLength(64)
  @IsOptional()
  wechat?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  notes?: string;
}
