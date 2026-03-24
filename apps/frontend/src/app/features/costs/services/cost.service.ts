import { Injectable, signal } from '@angular/core';
import { CostPeriod } from '../models/cost-period.model';

@Injectable({
  providedIn: 'root'
})
export class CostService {
  // Mock data for initial implementation
  private readonly mockData: CostPeriod[] = [
    {
      label: 'Ostatnie 24h',
      periodType: '24h',
      totalCost: 12.45,
      energyConsumedKwh: 15.2,
      averagePricePerKwh: 0.82,
      trendPercentage: -5.2
    },
    {
      label: 'Ostatnie 7 dni',
      periodType: '7d',
      totalCost: 98.60,
      energyConsumedKwh: 120.5,
      averagePricePerKwh: 0.81,
      trendPercentage: 2.1
    },
    {
      label: 'Ostatnie 30 dni',
      periodType: '30d',
      totalCost: 412.30,
      energyConsumedKwh: 510.0,
      averagePricePerKwh: 0.80,
      trendPercentage: -1.5
    }
  ];

  readonly costPeriods = signal<CostPeriod[]>(this.mockData);

  constructor() {}
}
