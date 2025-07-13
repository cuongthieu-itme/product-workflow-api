import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterStatusProductDTO {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  procedureId?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  page?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  limit?: number;
}
