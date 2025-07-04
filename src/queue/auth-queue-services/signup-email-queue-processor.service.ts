import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UserService } from 'src/user/user.service';
import { SendEmailDTO } from 'src/notification/dtos';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SEND_EMAIL_NOTIFICATION } from 'src/notification/notification-events.constant';
import { QueueKeys } from '../queue-keys.constant';

export class SignupEmailQueuePayloadDTO {
  constructor(public email: string) {}
}

@Processor(QueueKeys.SignupEmailQueue)
export class SignupEmailQueueProcessorService extends WorkerHost {
  constructor(
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process({ data }: Job<SignupEmailQueuePayloadDTO>): Promise<any> {
    const user = await this.userService.findUserByEmail(data.email);
    const payload = new SendEmailDTO(
      user.email,
      'Chào mừng đến với ứng dụng Workflow',
      `Workflow là nền tảng quản lý. Để sử dụng nền tảng này, bạn cần đợi quản trị viên xác thực tài khoản.`,
    );
    this.eventEmitter.emit(SEND_EMAIL_NOTIFICATION, payload);
  }
}
