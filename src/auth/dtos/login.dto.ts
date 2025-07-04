import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDTO {
  @IsNotEmpty()
  @IsString()
  emailOrUsername: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
