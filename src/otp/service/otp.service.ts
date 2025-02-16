import { Injectable } from '@nestjs/common';
import { AppConfigService } from 'src/common/config/config';
import { NotificationFactory } from 'src/notification/service/notification.factory';
import { RedisService } from 'src/redis/service/redis.service';
import { NotificationDto, OtpUtils } from '../utils';
import { INotificationPayload, NotificationType } from 'src/notification/interface';


@Injectable()
export class OtpService {
    private readonly otpConfig:any;

    constructor(
        private readonly notification:NotificationFactory,
        private readonly redis:RedisService,
        private readonly config:AppConfigService
    ){
        this.otpConfig = this.config.getOtpConfig();
    }

    async sendOtp(payload:NotificationDto): Promise<string>{
        let otp = OtpUtils.generateOtp(this.otpConfig.otp_length);
        const notificationPAyload:INotificationPayload = {
            recipient:payload.email,
            message: `Your OTP is: ${otp}`
        };
        await this.notification.getNotificationService(NotificationType.EMAIL)
            .notify(notificationPAyload);
        return otp;
    }

    async verifyOtp(payload:any): Promise<boolean>{
        return true;
    }

    
}
