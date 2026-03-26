import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CostCardComponent } from '../cost-card/cost-card.component';
import { CostPeriod } from '../../models/cost-period.model';

@Component({
  selector: 'app-cost-grid',
  standalone: true,
  imports: [CommonModule, CostCardComponent],
  templateUrl: './cost-grid.component.html',
  styleUrl: './cost-grid.component.scss'
})
export class CostGridComponent {
  readonly costPeriods = signal<CostPeriod[]>([
    {
      label: 'Last 90 days',
      periodType: '90d',
      totalCostFixed: 1250.45,
      totalCostDynamic: 980.20,
      energyConsumedKwh: 1540.5,
      averagePricePerKwh: 0.64,
      totalSavings: 270.25
    },
    {
      label: 'Last 30 days',
      periodType: '30d',
      totalCostFixed: 420.15,
      totalCostDynamic: 315.40,
      energyConsumedKwh: 520.2,
      averagePricePerKwh: 0.61,
      totalSavings: 104.75
    },
    {
      label: 'Last 7 days',
      periodType: '7d',
      totalCostFixed: 98.50,
      totalCostDynamic: 72.30,
      energyConsumedKwh: 125.8,
      averagePricePerKwh: 0.57,
      totalSavings: 26.20
    }
  ]);
}
