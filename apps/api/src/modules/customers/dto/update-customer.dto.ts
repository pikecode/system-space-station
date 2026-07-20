import { IsOptional, IsEnum, IsMobilePhone, IsDateString, IsString, MaxLength } from 'class-validator';
import { CustomerType, CustomerSource, CustomerStatus, Gender } from '@prisma/client';

export class UpdateCustomerDto {
  @IsOptional() @IsEnum(CustomerType) customerType?: CustomerType;
  @IsOptional() @IsString() @MaxLength(100) name?: string;
  @IsOptional() @IsMobilePhone('zh-CN') phone?: string;
  @IsOptional() @IsEnum(CustomerSource) source?: CustomerSource;
  @IsOptional() @IsString() tags?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() wechat?: string;
  @IsOptional() @IsEnum(Gender) gender?: Gender;
  @IsOptional() @IsDateString() birthday?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() creditCode?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() contactName?: string;
  @IsOptional() @IsMobilePhone('zh-CN') contactPhone?: string;
  @IsOptional() @IsEnum(CustomerStatus) status?: CustomerStatus;
}
