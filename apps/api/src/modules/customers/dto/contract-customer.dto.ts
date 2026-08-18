import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class ContractCustomerDto {
  @IsString()
  @MaxLength(32)
  contractedEmployeeNo: string;

  @IsOptional()
  @IsDateString()
  contractedAt?: string;
}
