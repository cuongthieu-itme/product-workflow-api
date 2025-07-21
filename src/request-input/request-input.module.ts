import { Module } from '@nestjs/common';
import { RequestInputService } from './request-input.service';
import { RequestInputController } from './request-input.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [RequestInputController],
  providers: [RequestInputService],
  exports: [RequestInputService],
})
export class RequestInputModule {}
