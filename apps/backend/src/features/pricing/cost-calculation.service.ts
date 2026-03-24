import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChargingSession } from '../charging/entities/charging-session.entity';
import { HourlyPrice } from './entities/hourly-price.entity';

export interface PricingConfig {
  fixedEnergyPrice: number; // e.g. 0.50 PLN/kWh
  variableTransmissionFee: number; // e.g. 0.43 PLN/kWh
  providerMargin: number; // e.g. 0.05 PLN/kWh (for dynamic)
}

@Injectable()
export class CostCalculationService {
  private readonly logger = new Logger(CostCalculationService.name);

  constructor(
    @InjectRepository(HourlyPrice)
    private readonly hourlyPriceRepo: Repository<HourlyPrice>,
  ) {}

  async calculateSessionCosts(session: ChargingSession, config: PricingConfig) {
    const { startTime, endTime, kwhAdded } = session;
    
    // 1. Fixed Cost Calculation (Simple)
    const costFixed = kwhAdded * (config.fixedEnergyPrice + config.variableTransmissionFee);

    // 2. Dynamic Cost Calculation (Hourly)
    // For simplicity in this MVP, we divide total kWh proportionally by duration in each hour
    // A more precise way would be to get real meter readings per hour from TeslaMate (future)
    const durationMs = endTime.getTime() - startTime.getTime();
    const kwhPerMs = kwhAdded / durationMs;

    let costDynamic = 0;
    let current = new Date(startTime);

    while (current < endTime) {
      const currentHourStart = new Date(current);
      currentHourStart.setMinutes(0, 0, 0);
      
      const nextHourStart = new Date(currentHourStart);
      nextHourStart.setHours(currentHourStart.getHours() + 1);

      const endOfSegment = nextHourStart < endTime ? nextHourStart : endTime;
      const segmentDurationMs = endOfSegment.getTime() - current.getTime();
      const segmentKwh = segmentDurationMs * kwhPerMs;

      const dateStr = current.toISOString().split('T')[0];
      const hour = current.getHours();

      const hourlyPrice = await this.hourlyPriceRepo.findOneBy({ date: dateStr, hour });
      
      const marketPrice = hourlyPrice ? Number(hourlyPrice.pricePerKwh) : 0; // Fallback to 0 if no data
      if (!hourlyPrice) {
        this.logger.warn(`No hourly price data for ${dateStr} hour ${hour}. Using 0 as market price.`);
      }

      const totalHourlyRate = marketPrice + config.providerMargin + config.variableTransmissionFee;
      costDynamic += segmentKwh * totalHourlyRate;

      current = endOfSegment;
    }

    return {
      costFixed: parseFloat(costFixed.toFixed(4)),
      costDynamic: parseFloat(costDynamic.toFixed(4)),
    };
  }
}
