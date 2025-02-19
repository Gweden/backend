import { Module } from '@nestjs/common';
import { OtpService } from './service/otp.service';
import { OtpController } from './controller/otp.controller';
import { NotificationFactory } from 'src/notification/service/notification.factory';
import { EmailService } from 'src/notification/service/email.service';
import { AppConfigService } from 'src/common/config/app-config.service';
import { RedisService } from 'src/redis/service/redis.service';
import { OtpCronService } from './service/otp-cron.service';

@Module({
  controllers: [OtpController],
  providers: [
    AppConfigService,
    OtpService, 
    EmailService,
    NotificationFactory,
    RedisService,
    OtpCronService
  ],
})
export class OtpModule {}
