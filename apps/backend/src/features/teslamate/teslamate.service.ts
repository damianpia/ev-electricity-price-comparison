import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { TeslaMateChargingProcess } from './entities/teslamate.entities';

@Injectable()
export class TeslaMateService {
  private readonly logger = new Logger(TeslaMateService.name);
  private readonly homeGeofenceName: string;

  constructor(
    @InjectRepository(TeslaMateChargingProcess, 'teslamate')
    private readonly chargingProcessRepo: Repository<TeslaMateChargingProcess>,
    private readonly configService: ConfigService,
  ) {
    this.homeGeofenceName = this.configService.get<string>('TESLAMATE_HOME_GEOFENCE_NAME', 'Home');
  }

  async getRecentChargingSessions(since?: Date): Promise<TeslaMateChargingProcess[]> {
    this.logger.log(`Fetching recent charging sessions${since ? ` since ${since.toISOString()}` : ''}`);
    
    return this.chargingProcessRepo.find({
      where: since ? { start_date: MoreThan(since) } : {},
      relations: ['geofence'],
      order: { start_date: 'ASC' },
    });
  }

  async getHomeChargingSessions(since?: Date): Promise<TeslaMateChargingProcess[]> {
    const sessions = await this.getRecentChargingSessions(since);
    
    // Filter for sessions where geofence matches our config (case insensitive)
    return sessions.filter((s) => 
      s.geofence?.name?.toLowerCase() === this.homeGeofenceName.toLowerCase()
    );
  }

  async getStrictHomeChargingSessions(since?: Date): Promise<TeslaMateChargingProcess[]> {
    return this.getHomeChargingSessions(since);
  }
}
