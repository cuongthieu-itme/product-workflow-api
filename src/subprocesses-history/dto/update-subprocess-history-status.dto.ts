import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { StatusSubprocessHistory } from '@prisma/client';

export class UpdateSubprocessHistoryStatusDto {
  @ApiProperty({ enum: StatusSubprocessHistory })
  @IsEnum(StatusSubprocessHistory)
  status: StatusSubprocessHistory;
}
