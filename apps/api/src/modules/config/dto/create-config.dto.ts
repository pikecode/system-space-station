import { IsNumber, Min, Max, IsInt, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateConfigDto {
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100) memberRatio: number;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100) deptHeadRatio: number;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100) marketHeadRatio: number;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100) companyRatio: number;
  @IsInt() @Min(1) @Max(365) settlementDays: number;
  @IsDateString() effectiveFrom: string;
  @IsOptional() @IsString() remark?: string;
}
