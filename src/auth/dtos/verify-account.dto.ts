import { IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyAccountDTO {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isVerifiedAccount: boolean;
}
