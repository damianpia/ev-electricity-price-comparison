import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Tariff } from './entities/tariff.entity';
import { Provider } from './entities/provider.entity';
import { ChargingSession } from '../charging/entities/charging-session.entity';
import { CreateProviderDto } from './dto/create-provider.dto';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Tariff)
    private tariffRepository: Repository<Tariff>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(ChargingSession)
    private readonly chargingSessionRepo: Repository<ChargingSession>,
  ) {}

  async getCostSummary(period: '7d' | '30d' | '90d') {
    const now = new Date();
    let startDate = new Date();

    if (period === '7d') startDate.setDate(now.getDate() - 7);
    else if (period === '30d') startDate.setDate(now.getDate() - 30);
    else if (period === '90d') startDate.setDate(now.getDate() - 90);

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
