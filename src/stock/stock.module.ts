import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockRepository } from './stock.repository';

@Module({
  providers: [StockService, StockRepository],
})
export class StockModule {}
