import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { InvestmentProductStatus, RiskTolerance } from '@prisma/client';

export class CreateInvestmentProductDto {
  @IsString()
  @MaxLength(60)
  productNo: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  productType?: string;

  @IsOptional()
  @IsEnum(RiskTolerance)
  riskLevel?: RiskTolerance;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsDateString()
  expectedStartAt?: string;

  @IsOptional()
  @IsDateString()
  expectedEndAt?: string;

  @IsOptional()
  @IsEnum(InvestmentProductStatus)
  status?: InvestmentProductStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}
