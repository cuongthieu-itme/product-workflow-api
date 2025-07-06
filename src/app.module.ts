import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DepartmentModule } from './department/department.module';
import { CommonModule } from './common/common.module';
import { NotificationModule } from './notification/notification.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QueueModule } from './queue/queue.module';
import { ScheduleModule } from '@nestjs/schedule';
import { StatusProductModule } from './status-product/status-product.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    DepartmentModule,
    CommonModule,
    NotificationModule,
    EventEmitterModule.forRoot(),
    QueueModule,
    ScheduleModule.forRoot(),
    StatusProductModule,
  ],
})
export class AppModule {
  // Removed CORS middleware since we're using global CORS configuration
  // This prevents conflicts and ensures consistent CORS handling across all routes
}
