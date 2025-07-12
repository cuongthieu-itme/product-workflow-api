import { Module } from '@nestjs/common';
import { ProcedureService } from './procedure.service';
import { ProcedureController } from './procedure.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [ProcedureController],
  providers: [ProcedureService],
  exports: [ProcedureService],
})
export class ProcedureModule {}
