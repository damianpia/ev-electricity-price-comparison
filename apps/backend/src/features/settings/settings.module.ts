import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Setting } from './entities/setting.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { TaskStatusService } from './task-status.service';
import { ChargingSession } from '../charging/entities/charging-session.entity';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Setting, ChargingSession]),
    ConfigModule,
    PricingModule,
  ],
  providers: [SettingsService, TaskStatusService],
  controllers: [SettingsController],
  exports: [SettingsService, TaskStatusService],
})
export class SettingsModule {}
