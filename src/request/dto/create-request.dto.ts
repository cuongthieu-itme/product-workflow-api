import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SourceRequest, PriorityType } from '@prisma/client';

export class CreateRequestInputDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sourceCountry?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateRequestMaterialDto {
  @ApiProperty()
  @IsInt()
  materialId: number;

  @ApiProperty()
  @IsInt()
  quantity: number;

  @ApiProperty({ type: () => CreateRequestInputDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRequestInputDto)
  requestInput?: CreateRequestInputDto;
}

export class AddMaterialToRequestDto {
  @ApiProperty()
  @IsInt()
  materialId: number;

  @ApiProperty()
  @IsInt()
  quantity: number;
}

export class RemoveMaterialFromRequestDto {
  @ApiProperty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  materialRequestId: number;
}

export class CreateRequestDto {
  @ApiProperty()
  @IsString()
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
  @IsEnum(SourceRequest)
  source: SourceRequest;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  customerId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  sourceOtherId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  createdById?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  statusProductId?: number;

  @ApiProperty({ type: [CreateRequestMaterialDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRequestMaterialDto)
  materials?: CreateRequestMaterialDto[];

  @ApiProperty({ enum: PriorityType })
  @IsEnum(PriorityType)
  priority: PriorityType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;
}
