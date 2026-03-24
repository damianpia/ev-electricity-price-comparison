import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { HourlyPrice } from './entities/hourly-price.entity';

@Injectable()
export class ExternalPriceService {
  private readonly logger = new Logger(ExternalPriceService.name);
  private readonly instrantApiUrl = 'https://energy-instrat-api.azurewebsites.net/api/prices/energy_price_rdn_hourly';

  constructor(
    @InjectRepository(HourlyPrice)
    private readonly hourlyPriceRepo: Repository<HourlyPrice>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3PM)
  async syncHourlyPrices(targetDate?: Date) {
    const today = targetDate || new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateStr = tomorrow.toISOString().split('T')[0];
    this.logger.log(`Syncing hourly prices for ${dateStr}...`);

    try {
      const response = await axios.get(this.instrantApiUrl, {
        params: {
          date_from: `${dateStr}T00:00:00Z`,
          date_to: `${dateStr}T23:59:59Z`,
        },
      });

      const data = response.data;
      if (!Array.isArray(data)) {
        this.logger.warn('Received invalid data format from Instrat API');
        return;
      }

      for (const item of data) {
        // item example: { "local_date": "2024-10-10T00:00:00", "price": 450.5 }
        const localDate = new Date(item.local_date);
        const hour = localDate.getHours();
        const priceMwh = parseFloat(item.price);
        const priceKwh = priceMwh / 1000;

        const existing = await this.hourlyPriceRepo.findOneBy({ 
          date: dateStr, 
          hour 
        });

        if (!existing) {
          const newPrice = this.hourlyPriceRepo.create({
            date: dateStr,
            hour,
            pricePerMwh: priceMwh,
            pricePerKwh: priceKwh,
          });
          await this.hourlyPriceRepo.save(newPrice);
        }
      }

      this.logger.log(`Successfully synced ${data.length} hourly prices for ${dateStr}.`);
    } catch (error) {
      this.logger.error(`Failed to sync hourly prices: ${error.message}`);
    }
  }

  // Helper method to sync a specific date range (useful for historical data)
  async syncHistoricalPrices(startDate: string, endDate: string) {
    this.logger.log(`Syncing historical prices from ${startDate} to ${endDate}...`);
    // Implementation for range sync if needed
  }
}
