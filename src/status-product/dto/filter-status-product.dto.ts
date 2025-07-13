import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterStatusProductDTO {
  @ApiProperty({
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  procedureId?: number;

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
