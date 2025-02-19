import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from '../service/otp.service';
import { NotificationDto,VerifyDto } from '../utils';

@Controller('otp')
export class OtpController {
    constructor(
        private readonly otp:OtpService
    ){}
    
    @Post('send')
    async generateOtp(@Body() payload:NotificationDto){
        return this.otp.sendOtp(payload);
    }

    @Post('resend')
    async resendOtp(@Body() payload:NotificationDto){
        return this.otp.resendOtp(payload);
    }

    @Post('verify')
    async verifyOtp(@Body() payload:VerifyDto){
        return this.otp.verifyOtp(payload);
    }

    
}
