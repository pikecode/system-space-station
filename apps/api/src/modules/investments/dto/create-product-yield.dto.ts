import { IsDateString, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateProductYieldDto {
  @IsString()
  productId: string;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalProfit: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}
