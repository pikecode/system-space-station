import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;
}
