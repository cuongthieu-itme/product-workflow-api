import { Module } from '@nestjs/common';
import { AccessoryService } from './accessory.service';
import { AccessoryController } from './accessory.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [AccessoryController],
  providers: [AccessoryService],
  exports: [AccessoryService],
})
export class AccessoryModule {}
