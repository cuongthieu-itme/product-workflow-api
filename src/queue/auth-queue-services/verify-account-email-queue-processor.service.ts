import { Processor, WorkerHost } from '@nestjs/bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserService } from 'src/user/user.service';
import { Job } from 'bullmq';
import { SendEmailDTO } from 'src/notification/dtos';
import { SEND_EMAIL_NOTIFICATION } from 'src/notification/notification-events.constant';
import { QueueKeys } from '../queue-keys.constant';

export class VerifyAccountEmailQueuePayloadDTO {
  constructor(public userId: number) {}
}

@Processor(QueueKeys.VerifyAccountEmailQueue)
export class VerifyAccountEmailQueueProcessorService extends WorkerHost {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
  ) {
    super();
  }

  async process({
    data,
  }: Job<VerifyAccountEmailQueuePayloadDTO>): Promise<any> {
    const user = await this.userService.findUserById(data.userId);
    const payload = new SendEmailDTO(
      user.email,
      'Xác thực tài khoản thành công',
      `${user.fullName} Tài khoản của bạn đã được xác thực thành công vào ${user.verifiedDate}`,
    );
    this.eventEmitter.emit(SEND_EMAIL_NOTIFICATION, payload);
  }
}
