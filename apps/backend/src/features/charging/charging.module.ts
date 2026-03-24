import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChargingSession } from './entities/charging-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChargingSession])],
  providers: [],
  exports: [TypeOrmModule],
})
export class ChargingModule {}
