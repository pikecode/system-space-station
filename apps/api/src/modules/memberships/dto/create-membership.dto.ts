import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateMembershipDto {
  @IsString() @IsNotEmpty() customerId: string;
  @IsOptional() @IsString() memberLevelId?: string;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) fee: number;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
}
