import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsEnum } from 'class-validator';
import { CheckField } from '@prisma/client';

export class UpdateOrCreateCheckFieldDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  subprocessId: number;

  @ApiProperty({
    type: [String],
    enum: CheckField,
  })
  @IsArray()
  @IsNotEmpty()
  @IsEnum(CheckField, { each: true })
  checkFields: CheckField[];
}
