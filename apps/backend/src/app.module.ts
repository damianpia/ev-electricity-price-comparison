import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { PricingModule } from './features/pricing/pricing.module';
import { QueryHistoryModule } from './features/query-history/query-history.module';
import { TeslaMateModule } from './features/teslamate/teslamate.module';
import { ChargingModule } from './features/charging/charging.module';
import { SettingsModule } from './features/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: configService.get<string>('NODE_ENV') === 'production',
        migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    PricingModule,
    QueryHistoryModule,
    TeslaMateModule,
    ChargingModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
