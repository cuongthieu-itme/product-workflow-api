import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterDepartmentDTO {
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
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  headId?: number;

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
