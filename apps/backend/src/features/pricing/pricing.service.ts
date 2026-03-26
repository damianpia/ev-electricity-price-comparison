import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Tariff } from './entities/tariff.entity';
import { Provider } from './entities/provider.entity';
import { HourlyPrice } from './entities/hourly-price.entity';
import { ChargingSession } from '../charging/entities/charging-session.entity';
import { CreateProviderDto } from './dto/create-provider.dto';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Tariff)
    private tariffRepository: Repository<Tariff>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(HourlyPrice)
    private readonly hourlyPriceRepo: Repository<HourlyPrice>,
    @InjectRepository(ChargingSession)
    private readonly chargingSessionRepo: Repository<ChargingSession>,
  ) {}

  async getCostSummary(period: string) {
    const now = new Date();
    let startDate = new Date();

    const daysMatch = period.match(/^(\d+)d$/);
    if (daysMatch) {
      const days = parseInt(daysMatch[1], 10);
      startDate.setDate(now.getDate() - days);
    } else {
      // Default to 30 days if format is invalid
      startDate.setDate(now.getDate() - 30);
    }

    const sessions = await this.chargingSessionRepo.find({
      where: {
        startTime: Between(startDate, now),
        isHome: true,
      },
    });

    const summary = sessions.reduce(
      (acc, s) => {
        acc.totalKwh += Number(s.kwhAdded);
        acc.totalCostFixed += Number(s.costFixed || 0);
        acc.totalCostDynamic += Number(s.costDynamic || 0);
        return acc;
      },
      { totalKwh: 0, totalCostFixed: 0, totalCostDynamic: 0 },
    );

    return {
      period,
      ...summary,
      totalSavings: summary.totalCostFixed - summary.totalCostDynamic,
      sessionCount: sessions.length,
    };
  }

  async getMonthlyBreakdown() {
    try {
      const sessions = await this.chargingSessionRepo.find({
        where: { isHome: true },
        order: { startTime: 'ASC' },
      });

      const monthlyData = new Map<string, any>();

      for (const s of sessions) {
        const date = new Date(s.startTime);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            month: monthKey,
            totalKwh: 0,
            totalCostFixed: 0,
            totalCostDynamic: 0,
            minPrice: 0,
          });
        }

        const data = monthlyData.get(monthKey);
        data.totalKwh += Number(s.kwhAdded);
        data.totalCostFixed += Number(s.costFixed || 0);
        data.totalCostDynamic += Number(s.costDynamic || 0);
      }

      // Fetch min prices for each month
      const breakdown = Array.from(monthlyData.values());
      for (const item of breakdown) {
        const [year, month] = item.month.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of month

        const minPriceRecord = await this.hourlyPriceRepo.createQueryBuilder('hp')
          .where('hp.date >= :start AND hp.date <= :end', { 
            start: startDate.toISOString().split('T')[0], 
            end: endDate.toISOString().split('T')[0] 
          })
          .orderBy('hp.pricePerKwh', 'ASC')
          .limit(1)
          .getOne();

        if (minPriceRecord) {
          item.minPrice = Number(minPriceRecord.pricePerKwh);
        }
      }

      return breakdown;
    } catch (error) {
      console.error('Error in getMonthlyBreakdown:', error);
      throw error;
    }
  }

  async findAllTariffs(): Promise<Tariff[]> {
    return this.tariffRepository.find({ relations: ['provider'] });
  }

  async findAllProviders(): Promise<Provider[]> {
    return this.providerRepository.find();
  }

  async createProvider(dto: CreateProviderDto): Promise<Provider> {
    const provider = this.providerRepository.create(dto);
    return this.providerRepository.save(provider);
  }

  async createTariff(tariffData: Partial<Tariff>, providerId: string): Promise<Tariff> {
    const provider = await this.providerRepository.findOneBy({ id: providerId });
    if (!provider) {
      throw new NotFoundException(`Provider with ID "${providerId}" not found`);
    }
    const tariff = this.tariffRepository.create({ ...tariffData, provider });
    return this.tariffRepository.save(tariff);
  }
}
