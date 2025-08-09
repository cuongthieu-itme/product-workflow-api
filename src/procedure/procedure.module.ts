import { Module } from '@nestjs/common';
import { ProcedureService } from './procedure.service';
import { ProcedureController } from './procedure.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { FieldSubprocessModule } from 'src/field-subprocess/field-subprocess.module';

@Module({
  imports: [UserModule, AuthModule, FieldSubprocessModule],
  controllers: [ProcedureController],
  providers: [ProcedureService],
  exports: [ProcedureService],
})
export class ProcedureModule {}
