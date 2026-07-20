import { IsOptional, IsString } from 'class-validator';

export class ReviewMembershipDto {
  @IsOptional() @IsString() reviewNote?: string;
  @IsOptional() @IsString() paidAt?: string;
}
