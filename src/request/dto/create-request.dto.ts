import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsInt,
  IsPositive,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SourceRequest, MaterialType, RequestStatus } from '@prisma/client';

export class RequestMaterialDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  materialId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    enum: MaterialType,
    description:
      'Material type for validation only - not stored in RequestMaterial table',
  })
  @IsNotEmpty()
  @IsEnum(MaterialType)
  materialType: MaterialType;
}

export class CreateRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productLink?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  media?: string[];

  @ApiProperty({ enum: SourceRequest })
  @IsNotEmpty()
  @IsEnum(SourceRequest)
  source: SourceRequest;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  customerId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  sourceOtherId?: number;

  @ApiProperty({
    enum: RequestStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  statusProductId?: number;

  @ApiProperty({
    type: [RequestMaterialDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestMaterialDto)
  materials?: RequestMaterialDto[];
}
