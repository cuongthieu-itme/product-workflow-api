import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsInt, IsObject } from 'class-validator';
import { UpdateFieldSubprocessDto } from './update-field-subprocess.dto';

export class BulkUpdateFieldSubprocessDto {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];

  @ApiProperty()
  @IsObject()
  data: UpdateFieldSubprocessDto;
}
