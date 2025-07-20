import { Module } from '@nestjs/common';
import { SourceOtherService } from './source-other.service';
import { SourceOtherController } from './source-other.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [SourceOtherController],
  providers: [SourceOtherService],
  exports: [SourceOtherService],
})
export class SourceOtherModule {}
