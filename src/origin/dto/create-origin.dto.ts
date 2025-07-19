import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateOriginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  name: string;
}
