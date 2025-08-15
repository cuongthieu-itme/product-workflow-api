import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  IsDateString,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { MaterialType, RequestMaterialStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNewMaterialDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image?: string[];

  @ApiProperty()
  @IsEnum(MaterialType)
  type: MaterialType;

  @ApiProperty()
  @IsNumber()
  originId: number;

  @ApiProperty()
  @IsEnum(RequestMaterialStatus)
  status: RequestMaterialStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  requestInput?: CreateMaterialRequestInputDto;
}

export class CreateMaterialRequestInputDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
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
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
