import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Tariff } from './entities/tariff.entity';
import { Provider } from './entities/provider.entity';
import { HourlyPrice } from './entities/hourly-price.entity';
import { ChargingSession } from '../charging/entities/charging-session.entity';
import { PricingService } from './pricing.service';
import { ExternalPriceService } from './external-price.service';
import { CostCalculationService } from './cost-calculation.service';
import { PricingController } from './pricing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tariff, Provider, HourlyPrice, ChargingSession]),
    ConfigModule,
  ],
  providers: [PricingService, ExternalPriceService, CostCalculationService],
  controllers: [PricingController],
  exports: [TypeOrmModule, PricingService, ExternalPriceService, CostCalculationService],
})
export class PricingModule {}
