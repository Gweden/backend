import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from 'src/common/config/app-config.service';
import { NotificationFactory } from 'src/notification/service/notification.factory';
import { RedisService } from 'src/redis/service/redis.service';
import { NotificationDto, OtpUtils, VerifyDto } from '../utils';
import { INotificationPayload, NotificationType } from 'src/notification/interface';


@Injectable()
export class OtpService {
    private readonly otpConfig:any;
    private readonly logger = new Logger(OtpService.name);

    constructor(
        private readonly notification:NotificationFactory,
        private readonly redis:RedisService,
        private readonly config:AppConfigService
    ){
        this.otpConfig = this.config.getOtpConfig();
    }

    async resendOtp(payload:NotificationDto): Promise<object>{
        const otpKey = OtpUtils.getOtpKey(payload.email);
        const otpResendKey = OtpUtils.getOtpResendKey(payload.email);

        const existingOtp = await this.redis.get(otpKey);
        const otpResend = await this.redis.get(otpResendKey);
        
        let otpResendCount = otpResend ? +otpResend.resendCount : 0;
        this.logger.debug(`otp resend Count: ${otpResendCount}`);

        this.logger.debug(existingOtp);
        this.logger.debug(otpResend);

        if(!existingOtp || existingOtp.used)
            return await this.sendOtp(payload);       

        if(otpResendCount >= Number(this.otpConfig.max_resend))
            throw new BadRequestException("OTP resend limit reached. Try again later.");

        this.logger.debug(`after all checks`);
        let otp:string = existingOtp.otp;
        await this.redis.set(otpResendKey,{
            resendCount:otpResendCount+1,
        },+this.otpConfig.resend_window_minutes*60);
        this.logger.debug(`otp resend : ${otpResendCount+1}`);
        await this.redis.set(otpKey,{
            otp,
            used:false,
        },+this.otpConfig.otp_expiry_seconds);

        await this.notifyOtp(payload.email,otp);
        
        return {
            otp
        };
    }
    

    async sendOtp(payload:NotificationDto): Promise<object>{
        const otpKey = OtpUtils.getOtpKey(payload.email);
        const otpListKey = OtpUtils.getListOtpKey(payload.email);
        const otpRequestKey = OtpUtils.getOtpRequestKey(payload.email);

        const existingOtp = await this.redis.get(otpKey);
        const otpRequest = await this.redis.get(otpRequestKey);
        let otpRequestCount = otpRequest ? +otpRequest.requestCount : 0;
        this.logger.debug(`otp request Count: ${otpRequestCount}`);

        this.logger.debug(existingOtp);
        this.logger.debug(otpRequest);

        let otp:string;
        this.logger.error(otpRequestCount >= Number(this.otpConfig.max_request),otpRequestCount,Number(this.otpConfig.max_request));
        if(otpRequestCount >= Number(this.otpConfig.max_request))
            throw new BadRequestException("OTP request limit reached. Try again later.");

        this.logger.debug(`after all checks`);
        otp = await this.updateCheckDuplicateOtp(otpListKey); 
        this.logger.debug(`after duplicates`);
        await this.redis.set(otpKey,{
            otp,
            used:false,
        },+this.otpConfig.otp_expiry_seconds);
        await this.redis.set(otpRequestKey,{
            requestCount:otpRequestCount+1,
        },+this.otpConfig.resend_window_minutes*60);
        
        this.logger.debug(`new OTP: ${otp}`);
        this.logger.debug(`new requestOTP request count: ${otpRequestCount+1}`);

        await this.notifyOtp(payload.email,otp);
        
        return {
            otp
        };
    }

    async verifyOtp(payload:VerifyDto): Promise<boolean>{
        const otpKey = OtpUtils.getOtpKey(payload.email);
        const otpRequestKey = OtpUtils.getOtpRequestKey(payload.email);
        const otpResendKey = OtpUtils.getOtpResendKey(payload.email);
        const storedOtp = await this.redis.get(otpKey);
        const otpRequest = await this.redis.get(otpRequestKey);
        const otpResend = await this.redis.get(otpResendKey);
        this.logger.log(`storedOtp: ${JSON.stringify(storedOtp)}`);
        this.logger.log(`otpRequest: ${JSON.stringify(otpRequest)}`);
        this.logger.log(`otpResend: ${JSON.stringify(otpResend)}`);
        if(!storedOtp)
            throw new BadRequestException("OTP expired or not found");
        if(storedOtp.used)
            throw new BadRequestException("OTP already used");
        if(storedOtp.otp !=payload.otp)
            throw new BadRequestException("Invalid OTP");
        const retentionPolicy = (+this.otpConfig.max_retention * 60 *60) ;
        storedOtp.used = true;
        await this.redis.set(otpKey,{...storedOtp},+this.otpConfig.otp_expiry_seconds);
        return true;
    }

    private async updateCheckDuplicateOtp(otpKey:string):Promise<string>{
        let otp:string;
        const keyType = await this.redis.type(otpKey);
        this.logger.warn(keyType);
        const previousOtps = await this.redis.lrange(otpKey, 0,-1);
        if (previousOtps.some((otpItem:any) => JSON.parse(otpItem).otp === otp)) {
            otp = OtpUtils.generateOtp(this.otpConfig.otp_length);
            this.logger.debug('Regenerated OTP: ' + otp);
        } else {
            otp = OtpUtils.generateOtp(this.otpConfig.otp_length);
        }
        const otpListPayload = {otp,timestamp:Date.now()};
        await this.redis.lpush(otpKey,JSON.stringify(otpListPayload));
        return otp;
    }

    private async notifyOtp(email:string,otp:string){
        const notificationPAyload:INotificationPayload = {
            recipient:email,
            message: `Your OTP is: ${otp}`
        };
        await this.notification.getNotificationService(NotificationType.EMAIL)
            .notify(notificationPAyload);
    }
    
}
