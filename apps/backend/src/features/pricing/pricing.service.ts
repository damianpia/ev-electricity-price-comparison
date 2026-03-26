import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Tariff } from './entities/tariff.entity';
import { Provider } from './entities/provider.entity';
import { HourlyPrice } from './entities/hourly-price.entity';
import { ChargingSession } from '../charging/entities/charging-session.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { OptimalChargingService } from './optimal-charging.service';

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
    private readonly optimalChargingService: OptimalChargingService,
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
            totalOptimalCost: 0,
            minPrice: 0,
            sessions: [],
          });
        }

        const data = monthlyData.get(monthKey);
        data.totalKwh += Number(s.kwhAdded);
        data.totalCostFixed += Number(s.costFixed || 0);
        data.totalCostDynamic += Number(s.costDynamic || 0);

        // Calculate optimal charging for this specific session
        const dateStr = date.toISOString().split('T')[0];
        const optimal = await this.optimalChargingService.calculate(dateStr, Number(s.kwhAdded), 6);
        
        data.totalOptimalCost += optimal.totalCost;

        data.sessions.push({
          id: s.id,
          startTime: s.startTime,
          endTime: s.endTime,
          kwhAdded: Number(s.kwhAdded),
          costFixed: Number(s.costFixed),
          costDynamic: Number(s.costDynamic),
          optimalCost: optimal.totalCost,
          optimalKwhPotential: Number(s.kwhAdded),
          optimalHours: optimal.hours.map(h => h.hour),
        });
      }

      // Fetch min prices for each month and finalize breakdown
      const breakdown = Array.from(monthlyData.values());
      for (const item of breakdown) {
        const [year, month] = item.month.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

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

        item.totalSavings = item.totalCostFixed - item.totalCostDynamic;
        item.savingsPercentage = item.totalCostFixed > 0 ? (item.totalSavings / item.totalCostFixed) * 100 : 0;
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
