import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { HourlyPrice } from './entities/hourly-price.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExternalPriceService {
  private readonly logger = new Logger(ExternalPriceService.name);
  private readonly pseApiUrl: string;

  constructor(
    @InjectRepository(HourlyPrice)
    private readonly hourlyPriceRepo: Repository<HourlyPrice>,
    private readonly configService: ConfigService,
  ) {
    this.pseApiUrl = this.configService.get<string>(
      'PSE_API_URL', 
      'https://api.raporty.pse.pl/api/rce-pln'
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_3PM)
  async syncHourlyPrices(targetDate?: Date) {
    const today = targetDate || new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateStr = tomorrow.toISOString().split('T')[0];
    return this.syncPriceForDate(dateStr);
  }

  async syncPriceForDate(dateStr: string) {
    // Check if we already have ALL 24 hours for this date
    const count = await this.hourlyPriceRepo.countBy({ date: dateStr });
    if (count >= 24) {
      return;
    }

    this.logger.log(`Syncing hourly prices from PSE for ${dateStr}...`);

    try {
      const response = await axios.get(this.pseApiUrl, {
        params: {
          '$filter': `business_date eq '${dateStr}'`,
        },
      });

      const items = (response.data as any)?.value;
      if (!Array.isArray(items) || items.length === 0) {
        this.logger.warn(`No price data returned from PSE API for ${dateStr}`);
        return;
      }

      // Group 15-min periods into hours
      const hourlyData: Record<number, number[]> = {};
      for (const item of items) {
        const hour = parseInt(item.period.split(':')[0], 10);
        if (!hourlyData[hour]) hourlyData[hour] = [];
        hourlyData[hour].push(parseFloat(item.rce_pln));
      }

      for (const hourStr of Object.keys(hourlyData)) {
        const hour = parseInt(hourStr, 10);
        const prices = hourlyData[hour];
        // Average price for the hour
        const avgPriceMwh = prices.reduce((a, b) => a + b, 0) / prices.length;
        const priceKwh = avgPriceMwh / 1000;

        const existing = await this.hourlyPriceRepo.findOneBy({ 
          date: dateStr, 
          hour 
        });

        if (!existing) {
          const newPrice = this.hourlyPriceRepo.create({
            date: dateStr,
            hour,
            pricePerMwh: avgPriceMwh,
            pricePerKwh: priceKwh,
          });
          await this.hourlyPriceRepo.save(newPrice);
        }
      }

      this.logger.log(`Successfully synced ${Object.keys(hourlyData).length} hours from PSE for ${dateStr}.`);
    } catch (error) {
      this.logger.error(`Failed to sync hourly prices from PSE for ${dateStr}: ${error.message}`);
    }
  }

  // Helper method to sync a specific date range (useful for historical data)
  async syncHistoricalPrices(startDate: string, endDate: string) {
    this.logger.log(`Syncing historical prices from ${startDate} to ${endDate}...`);
    // Implementation for range sync if needed
  }
}
