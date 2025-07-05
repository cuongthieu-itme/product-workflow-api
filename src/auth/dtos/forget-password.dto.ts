import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgetPasswordDTO {
  @ApiProperty({
    example: '',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
