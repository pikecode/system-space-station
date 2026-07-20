import { IsOptional, IsString, IsEnum } from 'class-validator';
import { MembershipStatus } from '@prisma/client';

export class QueryMembershipDto {
  @IsOptional() @IsString() customerId?: string;
  @IsOptional() @IsEnum(MembershipStatus) status?: MembershipStatus;
  @IsOptional() @IsString() page?: string;
  @IsOptional() @IsString() pageSize?: string;
}
