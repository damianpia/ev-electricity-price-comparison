import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tariff } from './entities/tariff.entity';
import { Provider } from './entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Tariff)
    private tariffRepository: Repository<Tariff>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
  ) {}

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
