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
  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  role: UserRole;

  @ApiProperty({
    required: false,
  })
  phoneNumber?: string;
}
