import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService extends ConfigService{
    constructor(){
        super();
    }
    static getAppPort(){
        return process.env.PORT ?? 8080;
    }

    getMailConfig(){
        return {
            host: this.get<string>("MAIL_HOST"),
            port: this.get<string>("MAIL_PORT"),
            secure: ['true', '1', 'yes'].includes((this.get<string>("MAIL_SECURE")??'').toLowerCase()),
            username: this.get<string>("MAIL_USERNAME"),
            password: this.get<string>("MAIL_PASSWORD"),
            encryption: this.get<string>("MAIL_ENCRYPTION"),
            from: this.get<string>("MAIL_FROM"),
            type: this.get<string>("MAIL_TYPE"),
        }
    }

    getOtpConfig(){
        return {
            otp_length: this.get<string>("OTP_LENGTH"),
            otp_expiry_seconds: this.get<string>("OTP_EXPIRY_SECONDS"),
            max_otps_per_hour: this.get<string>("MAX_OTPS_PER_HOUR"),
            resend_window_minutes: this.get<string>("RESEND_WINDOW_MINUTES"),
            max_resend: this.get<string>("MAX_RESENDS"),
            max_request: this.get<string>("MAX_OTPS_REQUEST_PER_HOUR"),
            max_retention: this.get<string>("MAX_RETENTION_HOURS"),
            max_otp_resend_time: this.get<string>("OTP_RESEND_TIME"),
        }
    }  
    
    getRedisConfig(){
        return {
            host: this.get<string>('REDIS_HOST'),
            port: this.get<string>('REDIS_PORT')
        }
    } 
}