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
}
