import { IsArray, IsNumber } from 'class-validator';

export class UpdateIsReadDto {
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}
