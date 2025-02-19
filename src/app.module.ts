import { Module } from '@nestjs/common';
import { OtpModule } from './otp/module';
import { NotificationModule } from './notification/notification.module';
import { CommonModule } from './common/module';
import { RedisModule } from './redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    CommonModule,
    RedisModule,
    NotificationModule,
    OtpModule,
  ]
})
export class AppModule {}
