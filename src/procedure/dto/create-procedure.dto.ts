import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProcedureDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  version: string;
}
