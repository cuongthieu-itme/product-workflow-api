import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStatusProductDTO {
  @ApiProperty({
    example: '',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({
    example: '',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  color: string;

  @ApiProperty({
    example: '',
  })
  @IsOptional()
  @IsString()
  @MinLength(4)
  description: string;

  @ApiProperty({
    example: '',
  })
  @IsNotEmpty()
  @IsNumber()
  procedureId: number;
}
