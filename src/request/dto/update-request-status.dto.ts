import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';

export class UpdateRequestStatusDto {
  @ApiProperty({ enum: RequestStatus })
  @IsNotEmpty()
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
