import { Injectable, Logger } from '@nestjs/common'
import { createClient, RedisClientType } from 'redis'

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name)
  private client: RedisClientType
  private stats = {
    hits: 0,
    misses: 0,
    errors: 0,
  }

  constructor() {
    this.client = createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
    })

    this.client.on('error', err => {
      this.logger.error('Redis Client Error', err)
      this.stats.errors++
    })

    this.client.on('connect', () => {
      this.logger.log('Redis Client Connected')
    })

    this.connect()
  }

  private async connect() {
    try {
      await this.client.connect()
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error)
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const result = await this.client.get(key)
      if (result) {
        this.stats.hits++
        this.logger.debug(`Cache HIT for key: ${key}`)
      } else {
        this.stats.misses++
        this.logger.debug(`Cache MISS for key: ${key}`)
      }
      return result
    } catch (error) {
      this.logger.error(`Error getting key ${key}`, error)
      this.stats.errors++
      return null
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value)
      } else {
        await this.client.set(key, value)
      }
      this.logger.debug(`Cache SET for key: ${key}`)
    } catch (error) {
      this.logger.error(`Error setting key ${key}`, error)
      this.stats.errors++
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key)
      this.logger.debug(`Cache DEL for key: ${key}`)
    } catch (error) {
      this.logger.error(`Error deleting key ${key}`, error)
      this.stats.errors++
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(keys)
        this.logger.debug(`Cache DEL pattern: ${pattern} (${keys.length} keys)`)
      }
    } catch (error) {
      this.logger.error(`Error deleting pattern ${pattern}`, error)
      this.stats.errors++
    }
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      errors: this.stats.errors,
      hitRate: `${hitRate.toFixed(2)}%`,
      total,
    }
  }

  async onModuleDestroy() {
    this.logger.log('Redis Stats:', this.getStats())
    await this.client.quit()
  }
}
