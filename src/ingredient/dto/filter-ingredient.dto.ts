import { IsOptional, IsString, IsInt, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FilterIngredientDto {
  @ApiProperty({
    example: '',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsString()
  @IsOptional()
  origin?: string;

  @ApiProperty({
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  page?: number;

  @ApiProperty({
    example: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  limit?: number;
}
