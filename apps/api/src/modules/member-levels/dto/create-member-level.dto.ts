import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class CreateMemberLevelDto {
  @IsString() @MaxLength(50) name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(0) sort?: number;
}
