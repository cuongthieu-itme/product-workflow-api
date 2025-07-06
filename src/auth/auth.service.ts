import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ForgetPasswordDTO,
  LoginDTO,
  ResetPasswordDTO,
  SignupDTO,
  VerifyAccountDTO,
} from './dtos';
import { TokenService } from 'src/common/token/token.service';
import { UserService } from 'src/user/user.service';
import { HashService } from 'src/common/hash/hash.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  ForgetPasswordNotification,
  LoginNotification,
  SignupNotification,
} from './notification-decorator';
import { InjectQueue } from '@nestjs/bullmq';
import { QueueKeys } from 'src/queue/queue-keys.constant';
import { Queue } from 'bullmq';
import { VerifyAccountNotification } from './notification-decorator/verify-account-notification.decorator';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly hashService: HashService,
    private readonly prismaService: PrismaService,
    @InjectQueue(QueueKeys.LoginEmailQueue)
    public readonly loginEmailQueueService: Queue,
    @InjectQueue(QueueKeys.SignupEmailQueue)
    public readonly signupEmailQueueService: Queue,
    @InjectQueue(QueueKeys.ForgetPasswordEmailQueue)
    public readonly forgetPasswordEmailQueueService: Queue,
    @InjectQueue(QueueKeys.VerifyAccountEmailQueue)
    public readonly verifyAccountEmailQueueService: Queue,
  ) {}

  @SignupNotification()
  async signup(dto: SignupDTO) {
    const user = await this.userService.createUser(dto);
    const accessToken = await this.tokenService.decodeAuthToken({
      userId: user.id,
      isVerifiedAccount: user.isVerifiedAccount,
      role: user.role,
    });
    return { accessToken };
  }

  @LoginNotification()
  async login(dto: LoginDTO) {
    const user = await this.userService.findUserByEmailOrUsernameAndPassword(
      dto.emailOrUsername,
      dto.password,
    );
    if (!user.isVerifiedAccount) {
      throw new BadRequestException(
        'Vui lòng đợi quản trị viên xác thực tài khoản của bạn',
      );
    }
    const accessToken = await this.tokenService.decodeAuthToken({
      isVerifiedAccount: user.isVerifiedAccount,
      role: user.role,
      userId: user.id,
    });
    await this.userService.updateUserById(user.id, {
      lastLoginDate: new Date(),
    });
    return { accessToken, userEmail: user.email };
  }

  @ForgetPasswordNotification()
  async forgetPassword(dto: ForgetPasswordDTO) {
    const user = await this.userService.findUserByEmail(dto.email, true);

    if (!user.isVerifiedAccount) {
      throw new BadRequestException(
        'Tài khoản chưa được xác thực. Vui lòng liên hệ quản trị viên.',
      );
    }

    await this.prismaService.resetPasswordToken.deleteMany({
      where: { userId: user.id },
    });

    const resetToken = this.tokenService.generateVerificationToken();
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1);

    await this.prismaService.resetPasswordToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: expirationTime,
      },
    });

    return { message: 'Link quên mật khẩu đã được gửi đến email của bạn' };
  }

  async resetPassword(token: string, dto: ResetPasswordDTO) {
    const resetPasswordToken =
      await this.prismaService.resetPasswordToken.findUnique({
        where: { token },
        include: { user: true },
      });

    if (!resetPasswordToken) {
      throw new NotFoundException('Token không hợp lệ');
    }

    if (resetPasswordToken.expiresAt < new Date()) {
      await this.prismaService.resetPasswordToken.delete({
        where: { id: resetPasswordToken.id },
      });
      throw new BadRequestException('Token đã hết hạn');
    }

    const hashedPassword = await this.hashService.encode(dto.newPassword);
    await this.prismaService.user.update({
      where: { id: resetPasswordToken.userId },
      data: { password: hashedPassword },
    });

    await this.prismaService.userSession.deleteMany({
      where: { userId: resetPasswordToken.userId },
    });

    await this.prismaService.resetPasswordToken.delete({
      where: { id: resetPasswordToken.id },
    });

    return { message: 'Mật khẩu đã được đổi thành công' };
  }

  @VerifyAccountNotification()
  async verifyAccount(dto: VerifyAccountDTO) {
    const user = await this.userService.findUserById(dto.id);

    await this.userService.updateVerificationState(
      user.id,
      dto.isVerifiedAccount,
    );
  }

  async logout(userId: number) {
    await this.prismaService.userSession.deleteMany({
      where: { userId },
    });
    return { message: 'Đăng xuất thành công' };
  }

  async logoutAll(userId: number) {
    const deletedSessions = await this.prismaService.userSession.deleteMany({
      where: { userId },
    });
    return {
      message: 'Đăng xuất khỏi tất cả thiết bị thành công',
      sessionsTerminated: deletedSessions.count,
    };
  }

  async logoutFromCurrentDevice(userId: number, currentToken: string) {
    const deletedSession = await this.prismaService.userSession.deleteMany({
      where: {
        userId,
        token: currentToken,
      },
    });
    return {
      message: 'Đăng xuất khỏi thiết bị hiện tại thành công',
      sessionTerminated: deletedSession.count > 0,
    };
  }

  async getMe(userId: number) {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    const { password, verifiedToken, ...userInfo } = user;
    return userInfo;
  }

  async verifyTokenDebug(token: string) {
    if (!token) {
      return {
        valid: false,
        error: 'Token is required',
        tokenLength: 0,
      };
    }

    try {
      const verifiedToken = this.tokenService.verifyToken(token);
      const user = await this.userService.findUserById(verifiedToken.userId);

      return {
        valid: true,
        decoded: verifiedToken,
        userExists: !!user,
        userVerified: user?.isVerifiedAccount || false,
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...',
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        errorName: error.name,
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...',
      };
    }
  }

  async getActiveSessions(userId: number) {
    const sessions = await this.prismaService.userSession.findMany({
      where: { userId },
      select: {
        token: true,
      },
    });

    const sessionsInfo = sessions.map((session) => {
      try {
        const decoded = this.tokenService.verifyToken(session.token) as any;
        return {
          tokenPreview: session.token.substring(0, 20) + '...',
          issuedAt: decoded.iat ? new Date(decoded.iat * 1000) : null,
          expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : null,
          valid: true,
        };
      } catch (error) {
        return {
          tokenPreview: session.token.substring(0, 20) + '...',
          valid: false,
          error: 'Token expired or invalid',
        };
      }
    });

    return {
      totalSessions: sessions.length,
      sessions: sessionsInfo,
    };
  }
}
