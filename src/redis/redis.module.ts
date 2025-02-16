import { Module } from '@nestjs/common';
import { AppConfigService } from 'src/common/config/config';
import { RedisService } from './service/redis.service';


@Module({
  providers: [
    AppConfigService,
    RedisService
  ],
  exports:[RedisService]
})
export class RedisModule {}
