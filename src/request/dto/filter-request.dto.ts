import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsPositive,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SourceRequest, MaterialType } from '@prisma/client';

export class FilterRequestDto {
  @ApiProperty({
    required: false,
    description: 'Filter by title (case insensitive partial match)',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by description (case insensitive partial match)',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: SourceRequest,
    required: false,
    description: 'Filter by source type',
  })
  @IsOptional()
  @IsEnum(SourceRequest)
  source?: SourceRequest;

  @ApiProperty({
    required: false,
    description: 'Filter by customer ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  customerId?: number;

  @ApiProperty({
    required: false,
    description: 'Filter by source other ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  sourceOtherId?: number;

  @ApiProperty({
    enum: MaterialType,
    required: false,
    description: 'Filter requests by material type',
  })
  @IsOptional()
  @IsEnum(MaterialType)
  materialType?: MaterialType;

  @ApiProperty({
    required: false,
    default: 1,
    description: 'Page number for pagination',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsPositive()
  page?: number;

  @ApiProperty({
    required: false,
    default: 10,
    description: 'Number of items per page',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsPositive()
  limit?: number;
}
