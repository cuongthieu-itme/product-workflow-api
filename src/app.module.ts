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
import { CustomerModule } from './customer/customer.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { FileModule } from './file/file.module';
import { IngredientModule } from './ingredient/ingredient.module';
import { AccessoryModule } from './accessory/accessory.module';
import { ProcedureModule } from './procedure/procedure.module';
import { SubprocessModule } from './subprocess/subprocess.module';
import { RequestModule } from './request/request.module';

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
    CustomerModule,
    CategoryModule,
    ProductModule,
    FileModule,
    IngredientModule,
    AccessoryModule,
    ProcedureModule,
    SubprocessModule,
    RequestModule,
  ],
})
export class AppModule {}
