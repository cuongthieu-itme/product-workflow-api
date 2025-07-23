import { RequestStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsNumber } from 'class-validator';

export class UpdateRequestStatusDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @IsOptional()
  @IsNumber()
  statusProductId?: number;
}
