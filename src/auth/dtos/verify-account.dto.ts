import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyAccountDTO {
  @ApiProperty({
    example: '',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isVerifiedAccount: boolean;
}
