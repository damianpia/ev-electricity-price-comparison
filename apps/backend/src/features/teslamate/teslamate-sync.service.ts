import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { ChargingSession } from '../charging/entities/charging-session.entity';
import { TeslaMateService } from './teslamate.service';

@Injectable()
export class TeslaMateSyncService {
  private readonly logger = new Logger(TeslaMateSyncService.name);

  constructor(
    private readonly teslaMateService: TeslaMateService,
    @InjectRepository(ChargingSession)
    private readonly chargingSessionRepo: Repository<ChargingSession>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async syncHomeChargingSessions(): Promise<number> {
    this.logger.log('Starting TeslaMate home charging sync...');
    
    // 1. Get the latest sync date from our DB
    const lastSession = await this.chargingSessionRepo.findOne({
      where: {},
      order: { startTime: 'DESC' },
    });
    
    const since = lastSession?.startTime;
    
    // 2. Fetch home sessions from TeslaMate
    const tmSessions = await this.teslaMateService.getStrictHomeChargingSessions(since);
    this.logger.log(`Found ${tmSessions.length} sessions to sync from TeslaMate.`);
    
    let syncedCount = 0;
    
    // 3. Map and save new sessions
    for (const tmSession of tmSessions) {
      // Check if session with this externalId already exists
      const existing = await this.chargingSessionRepo.findOneBy({ 
        externalId: tmSession.id 
      });
      
      if (existing) {
        continue;
      }

      // We only sync sessions that have an end_date (completed)
      if (!tmSession.end_date) {
        continue;
      }

      const newSession = this.chargingSessionRepo.create({
        externalId: tmSession.id,
        startTime: tmSession.start_date,
        endTime: tmSession.end_date,
        kwhAdded: tmSession.charge_energy_added || 0,
        isHome: true,
        locationName: tmSession.geofence?.name || 'Home',
      });

      await this.chargingSessionRepo.save(newSession);
      syncedCount++;
    }

    this.logger.log(`Sync completed. Successfully imported ${syncedCount} new sessions.`);
    return syncedCount;
  }
}
