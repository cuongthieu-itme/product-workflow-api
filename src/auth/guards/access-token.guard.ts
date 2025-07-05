import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from 'src/common/token/token.service';
import { AuthRequest } from 'src/common/types';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as AuthRequest;
    const headerToken = request.header('Authorization');

    if (!headerToken) {
      throw new UnauthorizedException('Yêu cầu header Authorization');
    }

    const [bearer, token] = headerToken.split(' ');

    if (!bearer || bearer.toLowerCase() !== 'bearer') {
      throw new UnauthorizedException(
        'Header Authorization phải là Bearer token',
      );
    }

    if (!token) {
      throw new UnauthorizedException('Yêu cầu JWT token');
    }

    try {
      const verifiedToken = this.tokenService.verifyToken(token);

      if (!verifiedToken) {
        throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
      }

      const activeSession = await this.prismaService.userSession.findFirst({
        where: {
          userId: verifiedToken.userId,
          token: token,
        },
      });

      if (!activeSession) {
        throw new UnauthorizedException(
          'Phiên làm việc đã bị chấm dứt. Vui lòng đăng nhập lại',
        );
      }

      const loggedInUser = await this.userService.findUserById(
        verifiedToken.userId,
      );

      if (!loggedInUser) {
        throw new UnauthorizedException('Không tìm thấy người dùng');
      }

      if (!loggedInUser.isVerifiedAccount) {
        throw new UnauthorizedException(
          'Tài khoản chưa được xác minh. Vui lòng liên hệ quản trị viên',
        );
      }

      request.user = loggedInUser;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Handle JWT-specific errors
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Định dạng JWT token không hợp lệ');
      }

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('JWT token đã hết hạn');
      }

      if (error.name === 'NotBeforeError') {
        throw new UnauthorizedException('JWT token chưa được kích hoạt');
      }

      // Generic error fallback
      throw new UnauthorizedException('Xác thực token thất bại');
    }
  }
}
