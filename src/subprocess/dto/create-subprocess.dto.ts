import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubprocessDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '',
  })
  @IsNumber()
  @Min(1)
  estimatedNumberOfDays: number;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  numberOfDaysBeforeDeadline?: number;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsString()
  @IsOptional()
  roleOfThePersonInCharge?: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isStepWithCost?: boolean;

  @ApiProperty({
    example: '',
  })
  @IsNumber()
  @IsNotEmpty()
  procedureId: number;
}
