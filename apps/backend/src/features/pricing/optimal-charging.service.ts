import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HourlyPrice } from './entities/hourly-price.entity';

export interface OptimalChargingResult {
  date: string;
  targetKwh: number;
  chargePower: number;
  totalCost: number;
  averagePrice: number;
  hours: {
    hour: number;
    price: number;
    kwhCharged: number;
    cost: number;
  }[];
}

@Injectable()
export class OptimalChargingService {
  private readonly logger = new Logger(OptimalChargingService.name);

  constructor(
    @InjectRepository(HourlyPrice)
    private readonly hourlyPriceRepo: Repository<HourlyPrice>,
  ) {}

  async calculate(
    date: string,
    targetKwh: number,
    chargePower: number = 6,
  ): Promise<OptimalChargingResult> {
    // 1. Get all prices for that day
    const prices = await this.hourlyPriceRepo.find({
      where: { date },
      order: { pricePerKwh: 'ASC' },
    });

    if (prices.length === 0) {
      this.logger.warn(`No price data found for date: ${date}`);
      return {
        date,
        targetKwh,
        chargePower,
        totalCost: 0,
        averagePrice: 0,
        hours: [],
      };
    }

    let remainingKwh = targetKwh;
    let totalCost = 0;
    const selectedHours: OptimalChargingResult['hours'] = [];

    // 2. Select cheapest hours until target is reached
    for (const p of prices) {
      if (remainingKwh <= 0) break;

      const canChargeInHour = chargePower; // kWh possible to charge in 1 hour
      const kwhToCharge = Math.min(remainingKwh, canChargeInHour);
      const costInHour = kwhToCharge * Number(p.pricePerKwh);

      selectedHours.push({
        hour: p.hour,
        price: Number(p.pricePerKwh),
        kwhCharged: parseFloat(kwhToCharge.toFixed(4)),
        cost: parseFloat(costInHour.toFixed(4)),
      });

      totalCost += costInHour;
      remainingKwh -= kwhToCharge;
    }

    // Sort back by hour for better readability
    selectedHours.sort((a, b) => a.hour - b.hour);

    return {
      date,
      targetKwh,
      chargePower,
      totalCost: parseFloat(totalCost.toFixed(4)),
      averagePrice: targetKwh > 0 ? parseFloat((totalCost / (targetKwh - remainingKwh)).toFixed(4)) : 0,
      hours: selectedHours,
    };
  }
}
