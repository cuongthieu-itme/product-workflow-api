import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationAdminModule } from 'src/notification-admin/notification-admin.module';
import { CodeGenerationModule } from 'src/common/code-generation/code-generation.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    NotificationAdminModule,
    CodeGenerationModule,
  ],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService],
})
export class RequestModule {}
