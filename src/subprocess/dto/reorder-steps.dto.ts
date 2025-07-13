import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class StepOrderItem {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsInt()
  step: number;
}

export class ReorderStepsDto {
  @ApiProperty()
  @IsInt()
  procedureId: number;

  @ApiProperty({ type: [StepOrderItem] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => StepOrderItem)
  steps: StepOrderItem[];
}
