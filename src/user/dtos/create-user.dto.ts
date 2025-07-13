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
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  fullName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  userName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    enum: UserRole,
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  phoneNumber?: string;
}
