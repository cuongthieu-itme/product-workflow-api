import { Module } from '@nestjs/common';
import { RequestApprovalInfoService } from './request-approval-info.service';
import { RequestApprovalInfoController } from './request-approval-info.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [RequestApprovalInfoController],
  providers: [RequestApprovalInfoService],
  exports: [RequestApprovalInfoService],
})
export class RequestApprovalInfoModule {}
