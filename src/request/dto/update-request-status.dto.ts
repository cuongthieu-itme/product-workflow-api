import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsNumber } from 'class-validator';

export class UpdateRequestStatusDto {
  @ApiProperty({
    enum: RequestStatus,
  })
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  statusProductId?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  productionPlan?: string;
}
