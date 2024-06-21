import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { releaseLock, tryAcquireLock } from './redis/lock';
import { retry } from './prisma/retry';

@Injectable()
export class LockManager {
  private readonly redisClient: Redis;

  constructor(private readonly redisService: RedisService) {
    this.redisClient = this.redisService.getClient();
  }

  async executeWithLock(
    lockKey: string,
    fn: () => Promise<void>,
    lockTimeout: number = 5,
    delayMs: number = 100,
  ): Promise<void> {
    await tryAcquireLock(this.redisClient, lockKey, delayMs, lockTimeout);

    try {
      await fn();
    } finally {
      await releaseLock(this.redisClient, lockKey);
    }
  }

  async retry<T>(
    fn: () => Promise<T>, 
    maxRetries: number, 
    delayMs: number = 100
  ): Promise<T> {
    return await retry(fn, maxRetries, delayMs);
  }
}
