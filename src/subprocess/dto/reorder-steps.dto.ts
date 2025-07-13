import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class StepOrderItem {
  @ApiProperty({ example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  step: number;
}

export class ReorderStepsDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  procedureId: number;

  @ApiProperty({ type: [StepOrderItem] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => StepOrderItem)
  steps: StepOrderItem[];
}
