import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  MinLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ProductMaterialDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  materialId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  quantity: number;
}

export class CreateProductDto {
  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  sku: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  categoryId: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  manufacturingProcess?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsInt()
  requestId?: number;

  @ApiProperty({ type: [ProductMaterialDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductMaterialDto)
  productMaterials?: ProductMaterialDto[];
}
