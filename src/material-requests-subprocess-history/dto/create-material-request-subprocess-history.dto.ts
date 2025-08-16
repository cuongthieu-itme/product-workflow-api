import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { MaterialType } from '@prisma/client';

export class CreateMaterialRequestSubprocessHistoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  code?: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  unit: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ enum: MaterialType, required: false })
  @IsOptional()
  @IsEnum(MaterialType)
  type?: MaterialType;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  originId: number;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  requestId: number;
}
