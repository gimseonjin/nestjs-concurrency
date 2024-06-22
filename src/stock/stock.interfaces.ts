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

export interface DecreaseStockParams {
  productId: number;
  quantity: number;
}
