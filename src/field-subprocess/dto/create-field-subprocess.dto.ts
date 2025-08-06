import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsInt, IsNotEmpty } from 'class-validator';

export class CreateFieldSubprocessDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  subprocessId: number;

  @ApiProperty({
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  materialIds: number[];
}
