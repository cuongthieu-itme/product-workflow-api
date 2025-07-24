import { Module } from '@nestjs/common';
import { SubprocessesHistoryService } from './subprocesses-history.service';
import { SubprocessesHistoryController } from './subprocesses-history.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [SubprocessesHistoryController],
  providers: [SubprocessesHistoryService],
  exports: [SubprocessesHistoryService],
})
export class SubprocessesHistoryModule {}
