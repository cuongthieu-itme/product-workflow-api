import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { NotificationModule } from './notification/notification.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QueueModule } from './queue/queue.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CorsMiddleware } from './common/middleware/cors.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    CommonModule,
    NotificationModule,
    EventEmitterModule.forRoot(),
    QueueModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*path');
  }
}
