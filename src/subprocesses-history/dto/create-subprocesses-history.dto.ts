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

export class CreateSubprocessesHistoryDto {
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

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean = false;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isStepWithCost?: boolean = false;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  step: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  procedureId: number;

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

  @ApiProperty({
    enum: StatusSubprocessHistory,
    default: StatusSubprocessHistory.PENDING,
  })
  @IsOptional()
  @IsEnum(StatusSubprocessHistory)
  status?: StatusSubprocessHistory = StatusSubprocessHistory.PENDING;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  userId?: number;
}
