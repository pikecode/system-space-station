import { IsDateString, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCustomerInvestmentDto {
  @IsString()
  customerId: string;

  @IsString()
  productId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsDateString()
  investedAt: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  contractedEmployeeNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}
