import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubprocessDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  estimatedNumberOfDays: number;

  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  numberOfDaysBeforeDeadline?: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  roleOfThePersonInCharge?: string;

  @ApiProperty({
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isStepWithCost?: boolean;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  procedureId: number;

  @ApiProperty()
  @IsNumber()
  step: number;
}
