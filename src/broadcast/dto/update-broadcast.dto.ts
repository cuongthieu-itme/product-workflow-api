import { PartialType } from '@nestjs/swagger';
import { CreateNotificationAdminDto } from './create-broadcast.dto';

export class UpdateNotificationAdminDto extends PartialType(
  CreateNotificationAdminDto,
) {}
