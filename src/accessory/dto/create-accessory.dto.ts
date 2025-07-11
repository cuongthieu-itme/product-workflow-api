import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccessoryDto {
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
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: [''],
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
