import { IsString, IsNotEmpty } from 'class-validator';

export class TransferCustomerDto {
  @IsString()
  @IsNotEmpty()
  newAssignedTo: string;
}
