import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsPositive,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SourceRequest, MaterialType, RequestStatus } from '@prisma/client';

export class FilterRequestDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: SourceRequest,
    required: false,
  })
  @IsOptional()
  @IsEnum(SourceRequest)
  source?: SourceRequest;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  customerId?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  sourceOtherId?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  statusProductId?: number;

  @ApiProperty({
    enum: MaterialType,
    required: false,
  })
  @IsOptional()
  @IsEnum(MaterialType)
  materialType?: MaterialType;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiProperty({
    required: false,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsPositive()
  page?: number;

  @ApiProperty({
    required: false,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsPositive()
  limit?: number;
}
