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
import { MaterialType } from '@prisma/client';

export class CreateNewMaterialDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image?: string[];

  @IsEnum(MaterialType)
  type: MaterialType;

  @IsNumber()
  originId: number;

  @IsOptional()
  requestInput?: CreateMaterialRequestInputDto;
}

export class CreateMaterialRequestInputDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  sourceCountry?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
