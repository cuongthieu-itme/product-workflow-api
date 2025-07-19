import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { SourceRequest, Material } from '@prisma/client';

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
  sourceType?: SourceRequest;

  @ApiProperty({
    enum: Material,
    required: false,
  })
  @IsOptional()
  @IsEnum(Material)
  materialType?: Material;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  customerId?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  sourceOtherId?: number;

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
