import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class ConfirmPaymentDto {
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  paidAmount?: number;
}
