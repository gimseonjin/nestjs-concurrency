import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';

export type Stock = {
  id: number;
  productId: number;
  quantity: number;
  version: number;
};

@Injectable()
export class StockRepository {
  constructor(private prismaService: PrismaService) {}

  async findStockByProductId(productId: number) {
    return this.prismaService.stock.findFirst({
      where: { productId: productId },
    });
  }

  async updateStockQuantity(
    stockId: number,
    quantity: number,
    version: number,
  ) {
    await this.prismaService.stock.update({
      where: {
        id: stockId,
        version: version,
      },
      data: {
        quantity: {
          decrement: quantity,
        },
        version: { increment: 1 },
      },
    });
  }
}
