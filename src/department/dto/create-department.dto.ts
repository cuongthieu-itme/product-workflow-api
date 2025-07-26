import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsArray,
} from 'class-validator';

export class CreateDepartmentDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  headId?: number;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  memberIds?: number[];
}
