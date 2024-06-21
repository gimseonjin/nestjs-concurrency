import { Injectable } from '@nestjs/common';
import { retry } from '../core/prisma/retry';
import { Stock, StockRepository } from './stock.repository';

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
  constructor(private stockRepository: StockRepository) {}

  async decrease(params: DecreaseStockParams, maxRetries = 10): Promise<void> {
    const { productId, quantity } = params;

    await retry(async () => {
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

  private validateStockQuantity(stock: Stock, quantity: number) {
    if (stock.quantity - quantity < 0) {
      throw new InsufficientStockError();
    }
  }
}
