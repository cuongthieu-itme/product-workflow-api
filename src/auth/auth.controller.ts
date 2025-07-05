import {
  Body,
  Controller,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgetPasswordDTO,
  LoginDTO,
  SignupDTO,
  VerifyAccountDTO,
  LoginResponseDTO,
  SignupResponseDTO,
} from './dtos';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập',
  })
  login(@Body() dto: LoginDTO): Promise<LoginResponseDTO> {
    return this.authService.login(dto);
  }

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Đăng kí',
  })
  signup(@Body() dto: SignupDTO): Promise<SignupResponseDTO> {
    return this.authService.signup(dto);
  }

  @Patch('forget-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Quên mật khẩu',
  })
  forgetPassword(@Body() dto: ForgetPasswordDTO): Promise<void> {
    return this.authService.forgetPassword(dto);
  }

  @Patch('verify-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xác thực tài khoản',
  })
  verifyAccount(@Body() dto: VerifyAccountDTO): Promise<void> {
    return this.authService.verifyAccount(dto);
  }
}
