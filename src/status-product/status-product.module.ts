import { Module } from '@nestjs/common';
import { StatusProductService } from './status-product.service';
import { StatusProductController } from './status-product.controller';
import { UserModule } from '../user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  providers: [StatusProductService],
  controllers: [StatusProductController],
  exports: [StatusProductService],
})
export class StatusProductModule {}
