import { IsOptional, IsString, IsEnum } from 'class-validator';
import { CustomerType, CustomerSource, CustomerStatus } from '@prisma/client';

export class QueryCustomerDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEnum(CustomerType) customerType?: CustomerType;
  @IsOptional() @IsEnum(CustomerSource) source?: CustomerSource;
  @IsOptional() @IsEnum(CustomerStatus) status?: CustomerStatus;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() assignedTo?: string;
  @IsOptional() @IsString() page?: string;
  @IsOptional() @IsString() pageSize?: string;
}
