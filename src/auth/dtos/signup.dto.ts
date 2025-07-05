import { CreateUserDTO } from 'src/user/dtos';
import { PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class SignupDTO extends PickType(CreateUserDTO, [
  'email',
  'fullName',
  'userName',
  'password',
  'role',
  'phoneNumber',
]) {
  @ApiProperty({
    example: '',
  })
  email: string;

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
  password: string;

  @ApiProperty({
    example: 'USER',
  })
  role: UserRole;

  @ApiProperty({
    example: '',
    required: false,
  })
  phoneNumber?: string;
}
