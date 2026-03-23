import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tariff } from './entities/tariff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tariff])],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule],
})
export class PricingModule {}
