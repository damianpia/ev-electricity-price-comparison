import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingService } from './pricing.service';
import { Tariff } from './entities/tariff.entity';
import { Provider } from './entities/provider.entity';
import { NotFoundException } from '@nestjs/common';

describe('PricingService', () => {
  let service: PricingService;
  let tariffRepo: Repository<Tariff>;
  let providerRepo: Repository<Provider>;

  const mockTariffRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockProviderRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: getRepositoryToken(Tariff),
          useValue: mockTariffRepo,
        },
        {
          provide: getRepositoryToken(Provider),
          useValue: mockProviderRepo,
        },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
    tariffRepo = module.get<Repository<Tariff>>(getRepositoryToken(Tariff));
    providerRepo = module.get<Repository<Provider>>(getRepositoryToken(Provider));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProvider', () => {
    it('should create and save a provider', async () => {
      const providerDto = { name: 'PGE', websiteUrl: 'https://pge.pl' };
      mockProviderRepo.create.mockReturnValue(providerDto);
      mockProviderRepo.save.mockReturnValue({ id: 'uuid', ...providerDto });

      const result = await service.createProvider(providerDto);

      expect(providerRepo.create).toHaveBeenCalledWith(providerDto);
      expect(providerRepo.save).toHaveBeenCalledWith(providerDto);
      expect(result).toEqual({ id: 'uuid', ...providerDto });
    });
  });

  describe('createTariff', () => {
    it('should create and save a tariff for an existing provider', async () => {
      const provider = { id: 'p-uuid', name: 'PGE' };
      const tariffData = { name: 'G11', pricePerKwh: 0.9 };
      const tariff = { ...tariffData, provider };

      mockProviderRepo.findOneBy.mockResolvedValue(provider);
      mockTariffRepo.create.mockReturnValue(tariff);
      mockTariffRepo.save.mockResolvedValue({ id: 't-uuid', ...tariff });

      const result = await service.createTariff(tariffData, 'p-uuid');

      expect(providerRepo.findOneBy).toHaveBeenCalledWith({ id: 'p-uuid' });
      expect(tariffRepo.create).toHaveBeenCalledWith({ ...tariffData, provider });
      expect(tariffRepo.save).toHaveBeenCalledWith(tariff);
      expect(result.name).toEqual('G11');
    });

    it('should throw an error if provider is not found', async () => {
      mockProviderRepo.findOneBy.mockResolvedValue(null);

      await expect(service.createTariff({}, 'invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
