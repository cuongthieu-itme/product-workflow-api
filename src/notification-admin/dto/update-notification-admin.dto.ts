import { PartialType } from '@nestjs/swagger';
import { CreateNotificationAdminDto } from './create-notification-admin.dto';

export class UpdateNotificationAdminDto extends PartialType(
  CreateNotificationAdminDto,
) {}
