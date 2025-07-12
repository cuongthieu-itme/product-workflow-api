import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FilterSubprocessDto {
  @ApiProperty({
    example: '',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

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
  @Transform(({ value }) => value === 'true')
  isRequired?: boolean;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isStepWithCost?: boolean;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  procedureId?: number;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  page?: number;

  @ApiProperty({
    example: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  limit?: number;
}
