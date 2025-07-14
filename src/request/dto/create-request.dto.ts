import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsInt,
  IsPositive,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SourceRequest } from '@prisma/client';

export class CreateRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productLink?: string[];

  @ApiProperty({
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image?: string[];

  @ApiProperty({
    enum: SourceRequest,
  })
  @IsNotEmpty()
  @IsEnum(SourceRequest)
  source: SourceRequest;

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

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  userId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  statusProductId: number;
}
