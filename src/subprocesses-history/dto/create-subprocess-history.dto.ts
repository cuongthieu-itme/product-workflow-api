import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { StatusSubprocessHistory } from '@prisma/client';

export class CreateSubprocessHistoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  estimatedNumberOfDays: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  numberOfDaysBeforeDeadline?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  roleOfThePersonInCharge?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isStepWithCost?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  step: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  procedureHistoryId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty({ enum: StatusSubprocessHistory, required: false })
  @IsOptional()
  @IsEnum(StatusSubprocessHistory)
  status?: StatusSubprocessHistory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  userId?: number;
}
