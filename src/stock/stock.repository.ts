import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { Prisma, PrismaClient } from '@prisma/client';

export type Stock = {
  id: number;
  productId: number;
  quantity: number;
  version: number;
};

@Injectable()
export class StockRepository {
  constructor(private prismaService: PrismaService) {}

  async findStockByProductIdWithPersimisticLock(
    productId: number,
    tx?: PrismaClient,
  ) {
    const stock = await (tx ?? this.prismaService).$queryRaw<Stock[]>(
      Prisma.sql`SELECT *
                 FROM stocks
                 WHERE productId = ${productId} FOR UPDATE`,
    );

    return stock[0] ?? null;
  }

  async findStockByProductId(productId: number, tx?: PrismaClient) {
    return (tx ?? this.prismaService).stock.findFirst({
      where: { productId: productId },
    });
  }

  async updateStockQuantity(
    stockId: number,
    quantity: number,
    version: number,
    tx?: PrismaClient,
  ) {
    await (tx ?? this.prismaService).stock.update({
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
