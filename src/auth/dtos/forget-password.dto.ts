import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgetPasswordDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
