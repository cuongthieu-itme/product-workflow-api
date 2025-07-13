import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}
