import { Module } from '@nestjs/common';
import { FieldSubprocessService } from './field-subprocess.service';
import { FieldSubprocessController } from './field-subprocess.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { MaterialModule } from 'src/material/material.module';

@Module({
  imports: [UserModule, AuthModule, MaterialModule],
  controllers: [FieldSubprocessController],
  providers: [FieldSubprocessService],
  exports: [FieldSubprocessService],
})
export class FieldSubprocessModule {}
