import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyAccountDTO {
  @ApiProperty({
    example: '',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    example: '',
  })
  @IsNotEmpty()
  @IsString()
  verificationCode: string;
}
