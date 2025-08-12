import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { BroadcastService } from './broadcast.service';
import { BroadcastController } from './broadcast.controller';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [BroadcastController],
  providers: [BroadcastService],
  exports: [BroadcastService],
})
export class BroadcastModule {}
