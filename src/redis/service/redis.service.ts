import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';
import { AppConfigService } from 'src/common/config/app-config.service';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: ReturnType<typeof createClient>;

  constructor(private readonly config: AppConfigService) {
    this.client = createClient({
      url: `${this.config.getRedisConfig().host}:${this.config.getRedisConfig().port}`,
    });
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async set(key: string, payload: any, ttl?: number) {
    this.logger.debug(`Setting key: ${key} payload ${JSON.stringify(payload)} ttl ${ttl}`);
    await this.client.set(key, JSON.stringify(payload), {
      EX: ttl,
    });
  }

  async get(key: string) {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async lpush(key: string, value: string) {
    await this.client.lPush(key, value);
  }

  async lrange(key: string, start: number, stop: number) {
    return this.client.lRange(key, start, stop);
  }

  async ltrim(key: string, start: number, stop: number) {
    await this.client.lTrim(key, start, stop);
  }

  async type(key: string) {
    return await this.client.type(key);
  }

  async cleanupOtpHistory(ttlConfig: number) {
    try{
        const keys = await this.client.keys('*');
        const currentTime = Date.now();
        const ttl =  ttlConfig * 60 * 60 * 1000;
        for (const key of keys){
            const keyType = await this.client.type(key);
            if(keyType === "list"){
                const otpList = await this.lrange(key,0,-1);
                const validOtps = otpList.filter((otpItem:any) => {
                    const otp = JSON.parse(otpItem);
                    return currentTime - otp.timestamp < ttl;
                });
                await this.del(key);
                for (const otp of validOtps) {
                    await this.lpush(key, otp);
                }
                this.logger.log(`Expired OTPs removed for key: ${key}`);
            }
        }
    }
    catch(error){
        this.logger.error('Error cleaning up OTP history:', error);
    }    
  }
}
