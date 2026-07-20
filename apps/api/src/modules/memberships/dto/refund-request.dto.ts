import { IsString, IsNotEmpty } from 'class-validator';

export class RefundRequestDto {
  @IsString() @IsNotEmpty() refundReason: string;
}
