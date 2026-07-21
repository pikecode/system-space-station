import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ReviewMembershipDto {
  @IsOptional() @IsString() reviewNote?: string;
  @IsOptional() @IsDateString() paidAt?: string;
}
