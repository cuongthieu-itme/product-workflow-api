import {
  Body,
  Controller,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
  Query,
  Delete,
  Request,
  Get,
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
  SuccessResponseDTO,
  UserResponseDTO,
} from './dtos';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/decorators';
import { AuthRequest } from 'src/common/types';

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

  @Post('/register')
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

  @Delete('/logout')
  @HttpCode(HttpStatus.OK)
  @AuthGuard()
  @ApiOperation({
    summary: 'Đăng xuất khỏi thiết bị hiện tại',
  })
  logout(@Request() req: AuthRequest): Promise<SuccessResponseDTO> {
    const token = req.header('Authorization')?.split(' ')[1];
    return this.authService.logoutFromCurrentDevice(req.user.id, token);
  }

  @Delete('/logout-all')
  @HttpCode(HttpStatus.OK)
  @AuthGuard()
  @ApiOperation({
    summary: 'Đăng xuất khỏi tất cả thiết bị',
  })
  logoutAll(@Request() req: AuthRequest): Promise<SuccessResponseDTO> {
    return this.authService.logoutAll(req.user.id);
  }

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  @AuthGuard()
  @ApiOperation({
    summary: 'Lấy thông tin người dùng hiện tại',
  })
  getMe(@Request() req: AuthRequest): Promise<UserResponseDTO> {
    return this.authService.getMe(req.user.id);
  }

  @Get('/sessions')
  @HttpCode(HttpStatus.OK)
  @AuthGuard()
  @ApiOperation({
    summary: 'Xem các session đang hoạt động',
  })
  getActiveSessions(@Request() req: AuthRequest) {
    return this.authService.getActiveSessions(req.user.id);
  }

  @Post('/verify-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify JWT token format',
  })
  async verifyToken(@Body() body: { token: string }) {
    try {
      return await this.authService.verifyTokenDebug(body.token);
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        tokenLength: body.token?.length || 0,
        tokenPreview: body.token?.substring(0, 20) + '...',
      };
    }
  }
}
