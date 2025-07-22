import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, IsDefined } from 'class-validator';

import { Type } from 'class-transformer';

export class UpdateIsReadDto {
  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Type(() => Number)
  ids: number[];
}
