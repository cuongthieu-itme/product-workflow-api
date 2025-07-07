import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { SendEmailDTO } from 'src/notification/dtos';
import { SEND_EMAIL_NOTIFICATION } from 'src/notification/notification-events.constant';
import { QueueKeys } from '../queue-keys.constant';

export class ForgetPasswordQueuePayloadDTO {
  constructor(public email: string) {}
}

@Processor(QueueKeys.ForgetPasswordEmailQueue)
export class ForgetPasswordEmailQueueProcessorService extends WorkerHost {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
  ) {
    super();
  }

  async process({ data }: Job<ForgetPasswordQueuePayloadDTO>): Promise<any> {
    const user = await this.userService.findUserByEmail(data.email);

    const resetPasswordToken =
      await this.prismaService.resetPasswordToken.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

    if (resetPasswordToken) {
      const resetLink = `http://localhost:3000/reset-password?token=${resetPasswordToken.token}`;

      const sendEmailPayload = new SendEmailDTO(
        user.email,
        `Đặt lại mật khẩu`,
        `Xin chào ${user.fullName},\n\nBạn đã yêu cầu quên mật khẩu. Vui lòng click vào link sau để đặt lại mật khẩu:\n\n${resetLink}\n\nLink này sẽ hết hạn sau 1 giờ.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\nTrân trọng,\nTeam Workflow`,
      );

      this.eventEmitter.emit(SEND_EMAIL_NOTIFICATION, sendEmailPayload);
    }
  }
}
