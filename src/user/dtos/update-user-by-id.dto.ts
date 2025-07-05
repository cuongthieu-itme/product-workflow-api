import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBaseUserInfoByIdDTO {
  @ApiProperty({
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(4)
  fullName?: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

export class UpdateUserByIdDTO extends UpdateBaseUserInfoByIdDTO {
  @ApiProperty({
    example: '',
    required: false,
  })
  @IsOptional()
  @IsDate()
  lastLoginDate?: Date;
}
