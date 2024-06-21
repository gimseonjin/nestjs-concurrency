import { Prisma } from '@prisma/client';

export class OptimisticLockError extends Error {
  constructor() {
    super('Optimistic lock error');
    this.name = 'OptimisticLockError';
  }
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delay = 100,
) {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        attempts++;
        if (attempts >= maxRetries) {
          throw new OptimisticLockError();
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  throw new Error('Max retries reached');
}
