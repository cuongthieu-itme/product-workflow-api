import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDTO {
  @ApiProperty({
    example: '',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    example: '',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/)
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
  @MaxLength(128)
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
  @Matches(/^[0-9]{10,11}$/)
  phoneNumber?: string;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  departmentId?: number;
}
