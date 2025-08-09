import { ApiProperty } from '@nestjs/swagger';
import { CheckField } from '@prisma/client';

export class CheckFieldResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  data: {
    id: number;
    subprocessId: number;
    checkField: CheckField[];
    createdAt: Date;
    updatedAt: Date;
    subprocess?: {
      id: number;
      name: string;
      description?: string;
      procedure?: {
        id: number;
        name: string;
        description?: string;
      };
      department?: {
        id: number;
        name: string;
        description?: string;
      };
    };
  };

  @ApiProperty({
    enum: ['created', 'updated'],
    description: 'Hành động đã thực hiện',
  })
  action: 'created' | 'updated';
}
