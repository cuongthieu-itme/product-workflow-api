import { Module } from '@nestjs/common';
import { EvaluateService } from './evaluate.service';
import { EvaluateController } from './evaluate.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [EvaluateController],
  providers: [EvaluateService],
  exports: [EvaluateService],
})
export class EvaluateModule {}
