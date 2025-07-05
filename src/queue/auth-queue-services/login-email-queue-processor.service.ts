import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SEND_EMAIL_NOTIFICATION } from 'src/notification/notification-events.constant';
import { SendEmailDTO } from 'src/notification/dtos';
import { UserService } from 'src/user/user.service';
import { QueueKeys } from 'src/queue/queue-keys.constant';

export class LoginEmailQueuePayloadDTO {
  constructor(public email: string) {}
}

@Processor(QueueKeys.LoginEmailQueue)
export class LoginEmailQueueProcessorService extends WorkerHost {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
  ) {
    super();
  }

  async process({ data }: Job<LoginEmailQueuePayloadDTO>): Promise<any> {
    const user = await this.userService.findUserByEmail(data.email);
    const sendEmailPayload = new SendEmailDTO(
      user.email,
      `Ai đó đã đăng nhập vào tài khoản của bạn`,
      `Xin chào ${user.fullName},\n\nChúng tôi phát hiện có người đăng nhập vào tài khoản của bạn vào lúc ${user.lastLoginDate}.\n\nNếu đây là bạn, bạn có thể bỏ qua thông báo này. Nếu không, vui lòng đổi mật khẩu ngay và liên hệ với bộ phận hỗ trợ.`,
    );
    this.eventEmitter.emit(SEND_EMAIL_NOTIFICATION, sendEmailPayload);
  }
}
