import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Setting } from './entities/setting.entity';
import { TaskStatusService } from './task-status.service';
import { ChargingSession } from '../charging/entities/charging-session.entity';
import { CostCalculationService, PricingConfig } from '../pricing/cost-calculation.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    @InjectRepository(ChargingSession)
    private readonly sessionRepository: Repository<ChargingSession>,
    private readonly configService: ConfigService,
    private readonly taskStatusService: TaskStatusService,
    private readonly costCalculationService: CostCalculationService,
  ) {}

  async onModuleInit() {
    this.logger.log('Settings service initialized');
    // We could pre-fill settings here if needed, but they are already fallbacking to env.
  }

  async get(key: string, defaultValue?: string): Promise<string> {
    const setting = await this.settingRepository.findOneBy({ key });
    if (setting) {
      return setting.value;
    }
    // Fallback to env if not in DB
    return this.configService.get<string>(key, defaultValue || '');
  }

  async getNumber(key: string, defaultValue: number): Promise<number> {
    const val = await this.get(key);
    return val !== '' ? parseFloat(val) : defaultValue;
  }

  async set(key: string, value: string, description?: string): Promise<Setting> {
    const setting = this.settingRepository.create({
      key,
      value,
      description,
    });
    return this.settingRepository.save(setting);
  }

  async getAll(): Promise<Record<string, string>> {
    const all = await this.settingRepository.find();
    const result: Record<string, string> = {};
    
    // Add DB settings
    for (const s of all) {
      result[s.key] = s.value;
    }

    // List of keys we care about
    const defaultKeys = [
      'TESLAMATE_HOME_GEOFENCE_NAME',
      'MIN_CHARGING_SESSION_KWH',
      'DEFAULT_FIXED_ENERGY_PRICE',
      'DEFAULT_TRANSMISSION_FEE',
      'DEFAULT_PROVIDER_MARGIN',
    ];

    // Ensure we have values for all keys (even if only from env)
    for (const key of defaultKeys) {
      if (!result[key]) {
        result[key] = this.configService.get<string>(key, '');
      }
    }

    return result;
  }

  async updateBulk(settings: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await this.set(key, value.toString());
    }
  }

  async recalculateAllSessions(): Promise<void> {
    if (this.taskStatusService.getStatus().active) {
      throw new Error('Recalculation already in progress');
    }

    const sessions = await this.sessionRepository.find();
    if (sessions.length === 0) return;

    // Start background task
    this.taskStatusService.startTask(sessions.length, 'Recalculating historical session costs...');

    // Load current pricing config and min kWh for the task
    const pricingConfig: PricingConfig = {
      fixedEnergyPrice: await this.getNumber('DEFAULT_FIXED_ENERGY_PRICE', 0.50),
      variableTransmissionFee: await this.getNumber('DEFAULT_TRANSMISSION_FEE', 0.43),
      providerMargin: await this.getNumber('DEFAULT_PROVIDER_MARGIN', 0.05),
    };

    const minKwh = await this.getNumber('MIN_CHARGING_SESSION_KWH', 0);

    // Run async loop without awaiting the whole thing (background)
    this.runRecalculation(sessions, pricingConfig, minKwh).catch(err => {
      this.logger.error(`Recalculation failed: ${err.message}`);
      this.taskStatusService.failTask(err.message);
    });
  }

  private async runRecalculation(sessions: ChargingSession[], config: PricingConfig, minKwh: number) {
    let processed = 0;
    for (const session of sessions) {
      // If session is now smaller than minKwh, we remove it
      if (Number(session.kwhAdded) < minKwh) {
        await this.sessionRepository.remove(session);
      } else {
        const { costFixed, costDynamic } = await this.costCalculationService.calculateSessionCosts(session, config);
        session.costFixed = costFixed;
        session.costDynamic = costDynamic;
        await this.sessionRepository.save(session);
      }
      
      processed++;
      this.taskStatusService.updateProgress(processed);
      
      // Small delay to prevent CPU spikes
      if (processed % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    this.taskStatusService.completeTask();
    this.logger.log(`Background recalculation of ${processed} sessions completed.`);
  }
}
