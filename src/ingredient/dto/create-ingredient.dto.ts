import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIngredientDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: '',
  })
  @IsInt()
  quantity: number;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  origin: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  image?: string[];

  @ApiProperty({
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
