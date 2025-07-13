import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStatusProductDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  color: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(4)
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  procedureId: number;
}
