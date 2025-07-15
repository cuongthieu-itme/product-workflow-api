import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({ default: false })
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
}
