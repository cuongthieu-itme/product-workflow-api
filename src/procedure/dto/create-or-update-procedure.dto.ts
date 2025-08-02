import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OutputType } from '@prisma/client';

class SubprocessDto {
  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  id?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsInt()
  estimatedNumberOfDays: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  numberOfDaysBeforeDeadline?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  roleOfThePersonInCharge?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isStepWithCost?: boolean;

  @ApiProperty()
  @IsInt()
  step: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  departmentId?: number;
}

export class SameAssignDto {
  @ApiProperty()
  @IsInt()
  departmentId: number;

  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  steps: number[];
}

export class CreateOrUpdateProcedureDto {
  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  id?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [SubprocessDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubprocessDto)
  subprocesses: SubprocessDto[];

  @ApiProperty({ type: [SameAssignDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SameAssignDto)
  @IsOptional()
  sameAssigns?: SameAssignDto[];

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(OutputType)
  outputType: OutputType;
}
