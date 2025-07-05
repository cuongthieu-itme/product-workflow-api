import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class LoginResponseDTO {
  @ApiProperty({
    example: '',
  })
  accessToken: string;

  @ApiProperty({
    example: '',
  })
  userEmail: string;
}

export class SignupResponseDTO {
  @ApiProperty({
    example: '',
  })
  accessToken: string;
}

export class UserResponseDTO {
  @ApiProperty({
    example: 0,
  })
  id: number;

  @ApiProperty({
    example: '',
  })
  fullName: string;

  @ApiProperty({
    example: '',
  })
  userName: string;

  @ApiProperty({
    example: '',
  })
  email: string;

  @ApiProperty({
    example: '',
  })
  phoneNumber?: string;

  @ApiProperty({
    example: true,
  })
  isVerifiedAccount: boolean;

  @ApiProperty({
    example: '',
  })
  verifiedDate?: Date;

  @ApiProperty({
    example: '',
  })
  role: UserRole;

  @ApiProperty({
    example: '',
  })
  lastLoginDate?: Date;

  @ApiProperty({
    example: '',
  })
  createdAt?: Date;
}

export class ApiErrorResponseDTO {
  @ApiProperty({
    example: 0,
  })
  statusCode: number;

  @ApiProperty({
    example: '',
  })
  message: string;

  @ApiProperty({
    example: '',
  })
  error: string;

  @ApiProperty({
    example: '',
  })
  timestamp: string;

  @ApiProperty({
    example: '',
  })
  path: string;
}

export class SuccessResponseDTO {
  @ApiProperty({
    example: '',
  })
  message: string;

  @ApiProperty({
    example: '',
  })
  status?: string;
}
