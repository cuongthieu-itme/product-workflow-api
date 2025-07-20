import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateSourceOtherDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  specifically: string;
}
