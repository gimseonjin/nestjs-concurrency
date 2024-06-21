import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './stock.service';
import { PrismaClient } from '@prisma/client';
import { CoreModule } from '../core/core.module';
import { StockRepository } from './stock.repository';
import { StockNotFoundError, InsufficientStockError } from './errors';

describe('StockService', () => {
  let service: StockService;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockService, StockRepository],
      imports: [CoreModule],
    }).compile();

    service = module.get<StockService>(StockService);

    await prisma.stock.create({
      data: {
        productId: 1,
        quantity: 10,
      },
    });
  });

  afterEach(async () => {
    await prisma.stock.deleteMany(); // 모든 데이터 삭제
  });

  describe('decreaseWithRetry', () => {
    it('재고 수량을 감소시켜야 한다 (retry)', async () => {
      await service.decreaseWithRetry({ productId: 1, quantity: 5 });

      const updatedStock = await prisma.stock.findFirst({
        where: { productId: 1 },
      });

      expect(updatedStock?.quantity).toBe(5);
    });

    it('재고를 찾을 수 없으면 StockNotFoundError를 던져야 한다 (retry)', async () => {
      await expect(
        service.decreaseWithRetry({ productId: 2, quantity: 5 }),
      ).rejects.toThrow(StockNotFoundError);
    });

    it('재고 수량이 부족하면 InsufficientStockError를 던져야 한다 (retry)', async () => {
      await expect(
        service.decreaseWithRetry({ productId: 1, quantity: 15 }),
      ).rejects.toThrow(InsufficientStockError);
    });

    it('동시성 문제를 처리하여 재고 수량을 올바르게 감소시켜야 한다 (retry)', async () => {
      const promises = Array.from({ length: 10 }).map(() =>
        service.decreaseWithRetry({ productId: 1, quantity: 1 }),
      );

      await Promise.all(promises);

      const updatedStock = await prisma.stock.findFirst({
        where: { productId: 1 },
      });

      expect(updatedStock?.quantity).toBe(0);
    });
  });

  describe('decreaseWithLock', () => {
    it('재고 수량을 감소시켜야 한다 (lock)', async () => {
      await service.decreaseWithLock({ productId: 1, quantity: 5 });

      const updatedStock = await prisma.stock.findFirst({
        where: { productId: 1 },
      });

      expect(updatedStock?.quantity).toBe(5);
    });

    it('재고를 찾을 수 없으면 StockNotFoundError를 던져야 한다 (lock)', async () => {
      await expect(
        service.decreaseWithLock({ productId: 2, quantity: 5 }),
      ).rejects.toThrow(StockNotFoundError);
    });

    it('재고 수량이 부족하면 InsufficientStockError를 던져야 한다 (lock)', async () => {
      await expect(
        service.decreaseWithLock({ productId: 1, quantity: 15 }),
      ).rejects.toThrow(InsufficientStockError);
    });

    it('동시성 문제를 처리하여 재고 수량을 올바르게 감소시켜야 한다 (lock)', async () => {
      const promises = Array.from({ length: 10 }).map(() =>
        service.decreaseWithLock({ productId: 1, quantity: 1 }),
      );

      await Promise.all(promises);

      const updatedStock = await prisma.stock.findFirst({
        where: { productId: 1 },
      });

      expect(updatedStock?.quantity).toBe(0);
    });
  });
});
