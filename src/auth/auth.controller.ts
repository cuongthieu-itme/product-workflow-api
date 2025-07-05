import {
  Body,
  Controller,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgetPasswordDTO,
  LoginDTO,
  ResetPasswordDTO,
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

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Quên mật khẩu - Gửi email reset password',
  })
  forgetPassword(@Body() dto: ForgetPasswordDTO): Promise<{ message: string }> {
    return this.authService.forgetPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đặt lại mật khẩu với token',
  })
  resetPassword(
    @Query('token') token: string,
    @Body() dto: ResetPasswordDTO,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(token, dto);
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
