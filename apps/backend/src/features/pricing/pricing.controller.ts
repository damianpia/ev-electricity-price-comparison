import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { Tariff } from './entities/tariff.entity';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

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
