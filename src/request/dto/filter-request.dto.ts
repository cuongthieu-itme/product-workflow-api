import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { SourceRequest } from '@prisma/client';

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
  @IsString()
  nameSource?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  specificSource?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  userId?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  statusProductId?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  page?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  limit?: number;
}
