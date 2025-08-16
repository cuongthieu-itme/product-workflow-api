import { Module } from '@nestjs/common';
import { MaterialRequestsSubprocessHistoryService } from './material-requests-subprocess-history.service';
import { MaterialRequestsSubprocessHistoryController } from './material-requests-subprocess-history.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { CodeGenerationModule } from 'src/common/code-generation/code-generation.module';

@Module({
  imports: [UserModule, AuthModule, CodeGenerationModule],
  controllers: [MaterialRequestsSubprocessHistoryController],
  providers: [MaterialRequestsSubprocessHistoryService],
  exports: [MaterialRequestsSubprocessHistoryService],
})
export class MaterialRequestsSubprocessHistoryModule {}
