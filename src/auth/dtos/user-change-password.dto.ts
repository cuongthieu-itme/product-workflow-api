import {
  IsString,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'MatchPasswords', async: false })
export class MatchPasswordsConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments) {
    const object = args.object as any;
    return confirmPassword === object.newPassword;
  }

  defaultMessage() {
    return 'Mật khẩu xác nhận không khớp với mật khẩu mới';
  }
}

export class UserChangePasswordDTO {
  @ApiProperty()
  @IsString()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty()
  @IsString()
  @Validate(MatchPasswordsConstraint)
  confirmPassword: string;
}
