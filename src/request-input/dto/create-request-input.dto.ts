import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsOptional,
  IsDateString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRequestInputDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expectedDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  supplier?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  sourceCountry?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  reason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  materialId?: number;
}
