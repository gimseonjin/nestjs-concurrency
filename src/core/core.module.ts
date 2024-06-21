import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { LockManager } from './lock.manager';

@Global()
@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  providers: [PrismaService, LockManager],
  exports: [PrismaService, LockManager],
})
export class CoreModule {}
