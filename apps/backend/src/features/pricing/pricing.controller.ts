import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { ExternalPriceService } from './external-price.service';
import { OptimalChargingService } from './optimal-charging.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { Tariff } from './entities/tariff.entity';

@Controller('pricing')
export class PricingController {
  constructor(
    private readonly pricingService: PricingService,
    private readonly externalPriceService: ExternalPriceService,
    private readonly optimalChargingService: OptimalChargingService,
  ) {}

  @Post('sync-prices')
  async syncPrices(@Body('date') date?: string) {
    const targetDate = date ? new Date(date) : undefined;
    await this.externalPriceService.syncHourlyPrices(targetDate);
    return { message: `Price sync triggered ${date ? `for date following ${date}` : 'for tomorrow'}` };
  }

  @Get('optimal')
  async getOptimalCharging(
    @Query('date') date: string,
    @Query('targetKwh') targetKwh: number,
    @Query('chargePower') chargePower?: number,
  ) {
    return this.optimalChargingService.calculate(date, Number(targetKwh), chargePower ? Number(chargePower) : 6);
  }

  @Get('summary')
  async getSummary(@Query('period') period: string = '30d') {
    return this.pricingService.getCostSummary(period);
  }

  @Get('monthly-breakdown')
  async getMonthlyBreakdown() {
    return this.pricingService.getMonthlyBreakdown();
  }

  @Get('providers')
  findAllProviders() {
    return this.pricingService.findAllProviders();
  }

  @Post('providers')
  createProvider(@Body() createProviderDto: CreateProviderDto) {
    return this.pricingService.createProvider(createProviderDto);
  }

  @Get('tariffs')
  findAllTariffs() {
    return this.pricingService.findAllTariffs();
  }

  @Post('providers/:id/tariffs')
  createTariff(
    @Param('id') providerId: string,
    @Body() tariffData: Partial<Tariff>,
  ) {
    return this.pricingService.createTariff(tariffData, providerId);
  }
}
