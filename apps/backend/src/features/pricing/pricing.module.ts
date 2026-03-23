import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tariff } from './entities/tariff.entity';
import { Provider } from './entities/provider.entity';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tariff, Provider])],
  providers: [PricingService],
  controllers: [PricingController],
  exports: [TypeOrmModule, PricingService],
})
export class PricingModule {}
