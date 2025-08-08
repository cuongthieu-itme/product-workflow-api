import { ApiProperty } from '@nestjs/swagger';

export class CheckFieldOptionDto {
  @ApiProperty({ description: 'Nhãn hiển thị bằng tiếng Việt' })
  label: string;

  @ApiProperty({ description: 'Tên trường trong model' })
  value: string;

  @ApiProperty({ description: 'Giá trị enum' })
  enumValue: string;

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
