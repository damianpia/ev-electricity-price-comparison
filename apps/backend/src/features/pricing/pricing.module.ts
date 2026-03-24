import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tariff } from './entities/tariff.entity';
import { Provider } from './entities/provider.entity';
import { HourlyPrice } from './entities/hourly-price.entity';
import { PricingService } from './pricing.service';
import { ExternalPriceService } from './external-price.service';
import { PricingController } from './pricing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tariff, Provider, HourlyPrice])],
  providers: [PricingService, ExternalPriceService],
  controllers: [PricingController],
  exports: [TypeOrmModule, PricingService, ExternalPriceService],
})
export class PricingModule {}
