import { IsString, IsOptional, IsEnum, IsInt, Min, MaxLength } from 'class-validator';
import { DepartmentType } from '@prisma/client';

export class CreateDepartmentDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsEnum(DepartmentType)
  type: DepartmentType;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  addressDetail?: string;
}
