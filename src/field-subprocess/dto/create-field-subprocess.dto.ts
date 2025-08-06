import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class CreateFieldSubprocessDto {
  @ApiProperty({
    type: [Number],
    description: 'Danh sách id của Material sẽ gán vào FieldSubprocess',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  materialIds: number[];
}
