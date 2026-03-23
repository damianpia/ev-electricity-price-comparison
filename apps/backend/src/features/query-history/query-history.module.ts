import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueryHistory } from './entities/query-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QueryHistory])],
  exports: [TypeOrmModule],
})
export class QueryHistoryModule {}
