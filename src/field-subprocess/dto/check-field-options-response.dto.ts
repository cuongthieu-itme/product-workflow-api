import { ApiProperty } from '@nestjs/swagger';
import { CheckFieldOptionDto } from './check-field-option.dto';

export class CheckFieldOptionsResponseDto {
  @ApiProperty({ type: [CheckFieldOptionDto] })
  data: CheckFieldOptionDto[];
}
