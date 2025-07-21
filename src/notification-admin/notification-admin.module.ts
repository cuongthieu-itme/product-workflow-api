import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationAdminService } from './notification-admin.service';
import { NotificationAdminController } from './notification-admin.controller';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [NotificationAdminController],
  providers: [NotificationAdminService],
  exports: [NotificationAdminService],
})
export class NotificationAdminModule {}
