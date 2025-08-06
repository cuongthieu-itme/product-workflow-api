import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class CreateFieldSubprocessDto {
  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  materialId?: number;
}