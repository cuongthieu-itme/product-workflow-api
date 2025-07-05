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
    description: 'User full name',
    example: 'John Doe',
    minLength: 4,
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(4)
  fullName?: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'newpassword123',
    minLength: 8,
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

export class UpdateUserByIdDTO extends UpdateBaseUserInfoByIdDTO {
  @ApiProperty({
    description: 'Last login date',
    example: '2023-12-01T10:00:00Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDate()
  lastLoginDate?: Date;
}
