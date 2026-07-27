import { IsEnum, IsMobilePhone, IsOptional, IsString, MaxLength, IsDateString } from 'class-validator';
import { CustomerType, Gender } from '@prisma/client';

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

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsDateString()
  @IsOptional()
  birthday?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  address?: string;

  @IsString()
  @MaxLength(18)
  @IsOptional()
  creditCode?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  industry?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  contactName?: string;

  @IsMobilePhone('zh-CN')
  @IsOptional()
  contactPhone?: string;
}
