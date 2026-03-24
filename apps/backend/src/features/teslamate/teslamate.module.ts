import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TeslaMateChargingProcess, TeslaMateGeofence } from './entities/teslamate.entities';
import { TeslaMateService } from './teslamate.service';
import { TeslaMateSyncService } from './teslamate-sync.service';
import { ChargingModule } from '../charging/charging.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: 'teslamate',
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('TESLAMATE_DB_HOST'),
        port: configService.get<number>('TESLAMATE_DB_PORT'),
        username: configService.get<string>('TESLAMATE_DB_USERNAME'),
        password: configService.get<string>('TESLAMATE_DB_PASSWORD'),
        database: configService.get<string>('TESLAMATE_DB_DATABASE'),
        entities: [TeslaMateChargingProcess, TeslaMateGeofence],
        synchronize: false,
        logging: false,
        extra: {
          ssl: configService.get<string>('TESLAMATE_DB_SSL') === 'true' ? {
            rejectUnauthorized: false
          } : false
        }
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([TeslaMateChargingProcess, TeslaMateGeofence], 'teslamate'),
    ChargingModule,
    ConfigModule,
  ],
  providers: [TeslaMateService, TeslaMateSyncService],
  exports: [TeslaMateService, TeslaMateSyncService],
})
export class TeslaMateModule {}
