import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsArray,
} from 'class-validator';

export class CreateDepartmentDTO {
  @ApiProperty({
    example: '',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsInt()
  headId?: number;

  @ApiPropertyOptional({
    example: [2, 3, 4],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  memberIds?: number[];
}
