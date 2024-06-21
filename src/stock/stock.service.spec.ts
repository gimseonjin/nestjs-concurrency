import { Test, TestingModule } from '@nestjs/testing';
import {
  InsufficientStockError,
  StockNotFoundError,
  StockService,
} from './stock.service';
import { PrismaClient } from '@prisma/client';
import { CoreModule } from '../core/core.module';
import { StockRepository } from './stock.repository';

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

    await prisma.stock.deleteMany(); // 모든 데이터 삭제
    await prisma.stock.create({
      data: {
        productId: 1,
        quantity: 10,
      },
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should decrease the stock quantity', async () => {
    await service.decrease({ productId: 1, quantity: 5 });

    const updatedStock = await prisma.stock.findFirst({
      where: { productId: 1 },
    });

    expect(updatedStock?.quantity).toBe(5);
  });

  it('should throw StockNotFoundError if stock is not found', async () => {
    await prisma.stock.deleteMany(); // 모든 데이터 삭제

    await expect(
      service.decrease({ productId: 2, quantity: 5 }),
    ).rejects.toThrow(StockNotFoundError);
  });

  it('should throw InsufficientStockError if stock quantity is insufficient', async () => {
    await expect(
      service.decrease({ productId: 1, quantity: 15 }),
    ).rejects.toThrow(InsufficientStockError);
  });

  it('should decrease the stock quantity correctly with sufficient stock', async () => {
    const promises = Array.from({ length: 10 }).map(() =>
      service.decrease({ productId: 1, quantity: 1 }),
    );

    await Promise.all(promises);

    const updatedStock = await prisma.stock.findFirst({
      where: { productId: 1 },
    });

    expect(updatedStock?.quantity).toBe(0); // 처음 10에서 5씩 2번 감소하면 0이어야 합니다.
  });
});
