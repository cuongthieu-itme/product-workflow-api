import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @ApiProperty({
    example: '',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  fullName: string;

  @ApiProperty({
    example: '',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  userName: string;

  @ApiProperty({
    example: '',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'USER',
    enum: UserRole,
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  phoneNumber?: string;
}
