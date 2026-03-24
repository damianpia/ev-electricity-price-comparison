import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { TeslaMateSyncService } from './teslamate-sync.service';
import { TeslaMateService } from './teslamate.service';
import { CostCalculationService } from '../pricing/cost-calculation.service';
import { ChargingSession } from '../charging/entities/charging-session.entity';
import { TeslaMateChargingProcess } from './entities/teslamate.entities';

describe('TeslaMateSyncService', () => {
  let syncService: TeslaMateSyncService;
  let teslaMateService: TeslaMateService;
  let chargingSessionRepo: Repository<ChargingSession>;

  const mockChargingSessionRepo = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockTeslaMateService = {
    getStrictHomeChargingSessions: jest.fn(),
  };

  const mockCostCalculationService = {
    calculateSessionCosts: jest.fn().mockResolvedValue({ costFixed: 10, costDynamic: 8 }),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue: string) => defaultValue),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeslaMateSyncService,
        {
          provide: TeslaMateService,
          useValue: mockTeslaMateService,
        },
        {
          provide: CostCalculationService,
          useValue: mockCostCalculationService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(ChargingSession),
          useValue: mockChargingSessionRepo,
        },
      ],
    }).compile();

    syncService = module.get<TeslaMateSyncService>(TeslaMateSyncService);
    teslaMateService = module.get<TeslaMateService>(TeslaMateService);
    chargingSessionRepo = module.get<Repository<ChargingSession>>(
      getRepositoryToken(ChargingSession),
    );
  });

  it('should be defined', () => {
    expect(syncService).toBeDefined();
  });

  describe('syncHomeChargingSessions', () => {
    it('should sync new home sessions from TeslaMate', async () => {
      const mockTmSession: Partial<TeslaMateChargingProcess> = {
        id: 123,
        start_date: new Date('2024-03-24T10:00:00Z'),
        end_date: new Date('2024-03-24T12:00:00Z'),
        charge_energy_added: 15.5,
        geofence: { id: 1, name: 'Home' },
      };

      mockChargingSessionRepo.findOne.mockResolvedValue(null); // No previous sync
      mockTeslaMateService.getStrictHomeChargingSessions.mockResolvedValue([mockTmSession]);
      mockChargingSessionRepo.findOneBy.mockResolvedValue(null); // Not already exists
      mockChargingSessionRepo.create.mockReturnValue(mockTmSession);
      mockChargingSessionRepo.save.mockResolvedValue(mockTmSession);

      const count = await syncService.syncHomeChargingSessions();

      expect(count).toBe(1);
      expect(teslaMateService.getStrictHomeChargingSessions).toHaveBeenCalled();
      expect(chargingSessionRepo.save).toHaveBeenCalled();
    });

    it('should skip sessions that already exist', async () => {
      const mockTmSession: Partial<TeslaMateChargingProcess> = {
        id: 123,
        start_date: new Date('2024-03-24T10:00:00Z'),
        end_date: new Date('2024-03-24T12:00:00Z'),
      };

      mockChargingSessionRepo.findOne.mockResolvedValue(null);
      mockTeslaMateService.getStrictHomeChargingSessions.mockResolvedValue([mockTmSession]);
      mockChargingSessionRepo.findOneBy.mockResolvedValue({ id: 'existing-uuid' });

      const count = await syncService.syncHomeChargingSessions();

      expect(count).toBe(0);
      expect(chargingSessionRepo.save).not.toHaveBeenCalled();
    });

    it('should skip sessions that are not completed (no end_date)', async () => {
      const mockTmSession: Partial<TeslaMateChargingProcess> = {
        id: 123,
        start_date: new Date('2024-03-24T10:00:00Z'),
        end_date: null,
      };

      mockChargingSessionRepo.findOne.mockResolvedValue(null);
      mockTeslaMateService.getStrictHomeChargingSessions.mockResolvedValue([mockTmSession]);
      mockChargingSessionRepo.findOneBy.mockResolvedValue(null);

      const count = await syncService.syncHomeChargingSessions();

      expect(count).toBe(0);
      expect(chargingSessionRepo.save).not.toHaveBeenCalled();
    });
  });
});
