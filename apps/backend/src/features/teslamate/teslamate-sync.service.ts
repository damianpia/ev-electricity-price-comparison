import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ChargingSession } from '../charging/entities/charging-session.entity';
import { TeslaMateService } from './teslamate.service';
import { ExternalPriceService } from '../pricing/external-price.service';
import { CostCalculationService, PricingConfig } from '../pricing/cost-calculation.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class TeslaMateSyncService implements OnModuleInit {
  private readonly logger = new Logger(TeslaMateSyncService.name);

  constructor(
    private readonly teslaMateService: TeslaMateService,
    private readonly externalPriceService: ExternalPriceService,
    private readonly costCalculationService: CostCalculationService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
    @InjectRepository(ChargingSession)
    private readonly chargingSessionRepo: Repository<ChargingSession>,
  ) {}

  async onModuleInit() {
    this.logger.log('Application started. Triggering initial TeslaMate sync...');
    await this.syncHomeChargingSessions();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncHomeChargingSessions(): Promise<number> {
    this.logger.log('Starting TeslaMate home charging sync...');
    
    // 1. Load configuration from SettingsService (with fallbacks)
    const pricingConfig: PricingConfig = {
      fixedEnergyPrice: await this.settingsService.getNumber('DEFAULT_FIXED_ENERGY_PRICE', 0.50),
      variableTransmissionFee: await this.settingsService.getNumber('DEFAULT_TRANSMISSION_FEE', 0.43),
      providerMargin: await this.settingsService.getNumber('DEFAULT_PROVIDER_MARGIN', 0.05),
    };

    const minKwh = await this.settingsService.getNumber('MIN_CHARGING_SESSION_KWH', 5.0);
    const lookbackDays = parseInt(this.configService.get<string>('TESLAMATE_SYNC_DAYS_BACK', '365'), 10);

    // 2. Determine the "since" date
    const lastSession = await this.chargingSessionRepo.findOne({
      where: {},
      order: { startTime: 'DESC' },
    });
    
    let since = lastSession?.startTime;
    
    // If no last session, use lookback limit
    if (!since) {
      since = new Date();
      since.setDate(since.getDate() - lookbackDays);
      this.logger.log(`Initial sync: looking back ${lookbackDays} days (since ${since.toISOString().split('T')[0]})`);
    }
    
    // 3. Fetch home sessions from TeslaMate
    const tmSessions = await this.teslaMateService.getStrictHomeChargingSessions(since);
    this.logger.log(`Found ${tmSessions.length} sessions to process from TeslaMate.`);
    
    if (tmSessions.length === 0) return 0;

    // 4. PRE-FETCH PRICES: Collect all unique dates from sessions to sync
    const uniqueDates = new Set<string>();
    for (const s of tmSessions) {
      if (s.end_date) {
        uniqueDates.add(s.start_date.toISOString().split('T')[0]);
        uniqueDates.add(s.end_date.toISOString().split('T')[0]);
      }
    }

    this.logger.log(`Ensuring hourly prices for ${uniqueDates.size} unique dates...`);
    for (const dateStr of uniqueDates) {
      await this.externalPriceService.syncPriceForDate(dateStr);
      // Small delay to prevent hitting PSE rate limits during batch fetch
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    let syncedCount = 0;
    
    // 5. Process and save sessions
    for (const tmSession of tmSessions) {
      // Check if session with this externalId already exists
      const existing = await this.chargingSessionRepo.findOneBy({ 
        externalId: tmSession.id 
      });
      
      if (existing || !tmSession.end_date) {
        continue;
      }

      // Filter out small sessions
      const kwhAdded = Number(tmSession.charge_energy_added || 0);
      if (kwhAdded < minKwh) {
        continue;
      }

      const newSessionStub = this.chargingSessionRepo.create({
        externalId: tmSession.id,
        startTime: tmSession.start_date,
        endTime: tmSession.end_date,
        kwhAdded: kwhAdded,
        isHome: true,
        locationName: tmSession.geofence?.name || 'Home',
      });

      // Calculate costs (prices are now guaranteed to be in DB)
      const { costFixed, costDynamic } = await this.costCalculationService.calculateSessionCosts(
        newSessionStub, 
        pricingConfig
      );

      newSessionStub.costFixed = costFixed;
      newSessionStub.costDynamic = costDynamic;

      await this.chargingSessionRepo.save(newSessionStub);
      syncedCount++;
    }

    this.logger.log(`Sync completed. Successfully imported ${syncedCount} new sessions.`);
    return syncedCount;
  }
}
