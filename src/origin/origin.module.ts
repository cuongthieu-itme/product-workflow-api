import { Module } from '@nestjs/common';
import { OriginService } from './origin.service';
import { OriginController } from './origin.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [OriginController],
  providers: [OriginService],
  exports: [OriginService],
})
export class OriginModule {}
