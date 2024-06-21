import Redis from 'ioredis';

export async function tryAcquireLock(
  redisClient: Redis,
  lockKey: string,
  delayMs: number,
  timeout: number,
) {
  while (true) {
    if (await acquireLock(redisClient, lockKey, timeout)) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

export async function acquireLock(
  redisClient: Redis,
  lockKey: string,
  timeout: number,
) {
  const lock = await redisClient.set(lockKey, 'locked', 'EX', timeout, 'NX');
  return lock === 'OK';
}

export async function releaseLock(redisClient: Redis, lockKey: string): Promise<void> {
  await redisClient.del(lockKey);
}
