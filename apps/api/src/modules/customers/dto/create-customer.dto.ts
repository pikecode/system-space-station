import {
  IsString, IsOptional, IsEnum, IsMobilePhone, IsDateString, MaxLength, IsBoolean, IsDecimal,
} from 'class-validator';
import { CustomerType, CustomerSource, Gender, RiskTolerance } from '@prisma/client';

export class CreateCustomerDto {
  @IsString()
  @IsOptional()
  shareCode?: string;

  @IsString()
  @IsOptional()
  assignedUserId?: string;

  @IsEnum(CustomerType)
  customerType: CustomerType;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsMobilePhone('zh-CN')
  phone: string;

  @IsOptional()
  @IsEnum(CustomerSource)
  source?: CustomerSource;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  wechat?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  creditCode?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsMobilePhone('zh-CN')
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  legalPerson?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  registeredCapital?: string;

  @IsOptional()
  @IsString()
  @MaxLength(18)
  idCard?: string;

  @IsOptional()
  @IsEnum(RiskTolerance)
  riskTolerance?: RiskTolerance;

  @IsOptional()
  @IsBoolean()
  isAccreditedInvestor?: boolean;

  @IsOptional()
  @IsDecimal()
  investmentAmount?: string;
}
