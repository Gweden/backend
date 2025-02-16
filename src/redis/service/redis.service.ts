import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';
import { AppConfigService } from 'src/common/config/config';


@Injectable()
export class RedisService implements OnModuleInit{
    private readonly logger = new Logger(RedisService.name);
    private readonly client:any;
    constructor(
        private readonly config:AppConfigService
    ){
        this.client = createClient({
            url:`${this.config.getRedisConfig().host}:${this.config.getRedisConfig().port}`
        });
    }

    async onModuleInit() {
        await this.client.connect();
    }

    async set(key:string,payload:any){
        await this.client.set(key,JSON.stringify(payload.value),{
            EX: payload.ttl,
        });
    }

    async get(){
        
    }

    async del(){
        
    }

    async incr(){
        
    }
    
}
