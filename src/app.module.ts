import { Module } from '@nestjs/common';
import { StockModule } from './stock/stock.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [StockModule, CoreModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
