import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { StatusSubprocessHistory } from '@prisma/client';

export class FilterSubprocessHistoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ enum: StatusSubprocessHistory, required: false })
  @IsOptional()
  @IsEnum(StatusSubprocessHistory)
  status?: StatusSubprocessHistory;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  procedureHistoryId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  departmentId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  userId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  limit?: number;
}
