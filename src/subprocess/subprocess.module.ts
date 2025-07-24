import { Module } from '@nestjs/common';
import { SubprocessService } from './subprocess.service';
import { SubprocessController } from './subprocess.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [SubprocessController],
  providers: [SubprocessService],
  exports: [SubprocessService],
})
export class SubprocessModule {}
