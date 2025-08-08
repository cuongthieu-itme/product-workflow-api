import { ApiProperty } from '@nestjs/swagger';

export class CheckFieldOptionDto {
  @ApiProperty({ description: 'Nhãn hiển thị bằng tiếng Việt' })
  label: string;

  @ApiProperty({ description: 'Giá trị của field' })
  value: string;

  @ApiProperty({
    enum: [
      'input',
      'select',
      'textarea',
      'date',
      'number',
      'checkbox',
      'radio',
      'file',
    ],
    description: 'Loại input control',
  })
  type:
    | 'input'
    | 'select'
    | 'textarea'
    | 'date'
    | 'number'
    | 'checkbox'
    | 'radio'
    | 'file';
}
