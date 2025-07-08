import { Module } from '@nestjs/common'
import { RedisService } from './redis.service'
import { CacheController } from './cache.controller'

@Module({
  controllers: [CacheController],
  providers: [RedisService],
  exports: [RedisService],
})
export class CacheModule {}
