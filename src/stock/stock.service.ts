import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';

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

type Stock = {
  id: number;
  productId: number;
  quantity: number;
};

@Injectable()
export class StockService {
  constructor(private prismaService: PrismaService) {}

  async decrease(params: DecreaseStockParams) {
    const { productId, quantity } = params;

    const stock = await this.findStockByProductId(productId);

    this.validateStockQuantity(stock, quantity);

    await this.updateStockQuantity(stock.id, quantity);
  }

  private async findStockByProductId(productId: number) {
    const stock = await this.prismaService.stock.findFirst({
      where: { productId: productId },
    });

    if (!stock) {
      throw new StockNotFoundError(productId);
    }

    return stock;
  }

  private validateStockQuantity(stock: Stock, quantity: number) {
    if (stock.quantity - quantity < 0) {
      throw new InsufficientStockError();
    }
  }

  private async updateStockQuantity(stockId: number, quantity: number) {
    await this.prismaService.stock.update({
      where: { id: stockId },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });
  }
}
