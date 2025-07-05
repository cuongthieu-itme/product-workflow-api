import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 4,
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  fullName: string;

  @ApiProperty({
    description: 'Username for login',
    example: 'johndoe',
    minLength: 4,
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  userName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    type: 'string',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'password123',
    minLength: 8,
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'User role',
    example: 'USER',
    enum: UserRole,
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    minLength: 10,
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  phoneNumber: string;
}
