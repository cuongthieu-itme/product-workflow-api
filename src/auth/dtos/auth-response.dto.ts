import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class LoginResponseDTO {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  userEmail: string;
}

export class SignupResponseDTO {
  @ApiProperty()
  accessToken: string;
}

export class UserResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber?: string;

  @ApiProperty()
  isVerifiedAccount: boolean;

  @ApiProperty()
  verifiedDate?: Date;

  @ApiProperty()
  role: UserRole;

  @ApiProperty()
  lastLoginDate?: Date;

  @ApiProperty()
  createdAt?: Date;
}

export class ApiErrorResponseDTO {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  error: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  path: string;
}

export class SuccessResponseDTO {
  @ApiProperty()
  message: string;

  @ApiProperty()
  status?: string;
}
