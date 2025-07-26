import {
  Body,
  Controller,
  Patch,
  Post,
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
  ChangePasswordDTO,
  UserChangePasswordDTO,
} from './dtos';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/decorators';
import { AuthRequest } from 'src/common/types';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Đăng nhập',
  })
  @Post('/login')
  login(@Body() dto: LoginDTO) {
    return this.authService.login(dto);
  }

  @ApiOperation({
    summary: 'Đăng kí',
  })
  @Post('/register')
  signup(@Body() dto: SignupDTO) {
    return this.authService.signup(dto);
  }

  @ApiOperation({
    summary: 'Quên mật khẩu - Gửi email reset password',
  })
  @Post('forgot-password')
  forgetPassword(@Body() dto: ForgetPasswordDTO) {
    return this.authService.forgetPassword(dto);
  }

  @ApiOperation({
    summary: 'Đặt lại mật khẩu với token',
  })
  @Post('reset-password')
  resetPassword(@Query('token') token: string, @Body() dto: ResetPasswordDTO) {
    return this.authService.resetPassword(token, dto);
  }

  @ApiOperation({
    summary: 'Xác thực tài khoản',
  })
  @Patch('verify-account')
  verifyAccount(@Body() dto: VerifyAccountDTO) {
    return this.authService.verifyAccount(dto);
  }

  @ApiOperation({
    summary: 'Thay đổi mật khẩu của user hiện tại',
  })
  @Patch('/change-password')
  @AuthGuard()
  changePassword(
    @Request() req: AuthRequest,
    @Body() dto: UserChangePasswordDTO,
  ) {
    return this.authService.changePassword(req.user.id, dto);
  }

  @ApiOperation({
    summary: 'Đăng xuất khỏi thiết bị hiện tại',
  })
  @Delete('/logout')
  @AuthGuard()
  logout(@Request() req: AuthRequest) {
    const token = req.header('Authorization')?.split(' ')[1];
    return this.authService.logoutFromCurrentDevice(req.user.id, token);
  }

  @ApiOperation({
    summary: 'Đăng xuất khỏi tất cả thiết bị',
  })
  @Delete('/logout-all')
  @AuthGuard()
  logoutAll(@Request() req: AuthRequest) {
    return this.authService.logoutAll(req.user.id);
  }

  @ApiOperation({
    summary: 'Lấy thông tin người dùng hiện tại',
  })
  @Get('/me')
  @AuthGuard()
  getMe(@Request() req: AuthRequest) {
    return this.authService.getMe(req.user.id);
  }

  @ApiOperation({
    summary: 'Đổi mật khẩu (Admin)',
  })
  @Patch('change-password-admin')
  @AuthGuard()
  changePasswordAdmin(@Body() dto: ChangePasswordDTO) {
    return this.authService.changePasswordAdmin(dto);
  }
}
