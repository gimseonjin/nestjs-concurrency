import { Injectable } from '@nestjs/common';
import { Stock, StockRepository } from './stock.repository';
import { LockManager } from '../core/lock.manager';

export class StockNotFoundError extends Error {
  constructor(productId: number) {
    super(`Stock not found for product ID ${productId}`);
    this.name = 'StockNotFoundError';
  }
}

export class InsufficientStockError extends Error {
  constructor() {
    super('Insufficient stock');
    this.name = 'InsufficientStockError';
  }
}

interface DecreaseStockParams {
  productId: number;
  quantity: number;
}

@Injectable()
export class StockService {
  constructor(
    private stockRepository: StockRepository,
    private lockManager: LockManager
  ) {}

  async decreaseWithRetry(params: DecreaseStockParams, maxRetries = 10): Promise<void> {
    const { productId, quantity } = params;

    await this.lockManager.retry(async () => {
      const stock = await this.stockRepository.findStockByProductId(productId);
      if (!stock) {
        throw new StockNotFoundError(productId);
      }

      this.validateStockQuantity(stock, quantity);

      await this.stockRepository.updateStockQuantity(
        stock.id,
        quantity,
        stock.version,
      );
    }, maxRetries);
  }

  async decreaseWithLock(params: DecreaseStockParams): Promise<void> {
    const { productId, quantity } = params;
    const lockKey = `lock:stock:${productId}`;

    await this.lockManager.executeWithLock(lockKey, async () => {
      const stock = await this.stockRepository.findStockByProductId(productId);
      if (!stock) {
        throw new StockNotFoundError(productId);
      }

      this.validateStockQuantity(stock, quantity);

      await this.stockRepository.updateStockQuantity(
        stock.id,
        quantity,
        stock.version,
      );
    });
  }

  private validateStockQuantity(stock: Stock, quantity: number) {
    if (stock.quantity - quantity < 0) {
      throw new InsufficientStockError();
    }
  }
}
