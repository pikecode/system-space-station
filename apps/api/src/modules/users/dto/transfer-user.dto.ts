import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { UserRole } from '@prisma/client';

export class TransferUserDto {
  @IsString()
  @IsNotEmpty()
  newDepartmentId: string;

  @IsEnum(UserRole)
  @IsOptional()
  newRole?: UserRole;

  @IsString()
  @IsOptional()
  successorId?: string;
}
