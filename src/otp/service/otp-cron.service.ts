import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from 'src/common/config/app-config.service';
import { RedisService } from 'src/redis/service/redis.service';
import { Cron, CronExpression } from '@nestjs/schedule';


@Injectable()
export class OtpCronService {
    private readonly otpConfig:any;
    private readonly logger = new Logger(OtpCronService.name);

    constructor(
        private readonly redis:RedisService,
        private readonly config:AppConfigService
    ){
        this.otpConfig = this.config.getOtpConfig();
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleCron() {
      this.logger.log("Running OTP cleanup...");
      await this.redis.cleanupOtpHistory(Number(this.otpConfig.max_retention));
    }
    
}
