import { Module } from '@nestjs/common';
import { EmailService } from './service/email.service';
import { AppConfigService } from 'src/common/config/app-config.service';
import { NotificationFactory } from './service/notification.factory';

@Module({
  providers: [
    AppConfigService,
    EmailService,
    NotificationFactory
  ],
  exports:[NotificationFactory]
})
export class NotificationModule {}
