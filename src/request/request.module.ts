import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { BroadcastModule } from 'src/broadcast/broadcast.module';
import { CodeGenerationModule } from 'src/common/code-generation/code-generation.module';

@Module({
  imports: [UserModule, AuthModule, BroadcastModule, CodeGenerationModule],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService],
})
export class RequestModule {}
