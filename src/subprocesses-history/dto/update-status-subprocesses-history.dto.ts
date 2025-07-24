import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsEnum } from 'class-validator';
import { StatusSubprocessHistory } from '@prisma/client';

export class UpdateStatusSubprocessHistoryDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty({ enum: StatusSubprocessHistory })
  @IsEnum(StatusSubprocessHistory)
  status: StatusSubprocessHistory;
}