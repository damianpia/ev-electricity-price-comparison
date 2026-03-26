import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CostService } from '../../services/cost.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-monthly-breakdown',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './monthly-breakdown.component.html',
  styleUrl: './monthly-breakdown.component.scss'
})
export class MonthlyBreakdownComponent {
  private readonly costService = inject(CostService);
  readonly breakdown = this.costService.monthlyBreakdown;

  readonly chartData = computed<ChartData<'bar'>>(() => {
    const data = this.breakdown();
    return {
      labels: data.map(d => d.month),
      datasets: [
        {
          data: data.map(d => d.totalCostFixed),
          label: 'G11 Cost (Fixed)',
          backgroundColor: '#757575', // Stronger gray
          borderColor: '#424242',
          borderWidth: 1
        },
        {
          data: data.map(d => d.totalCostDynamic),
          label: 'Dynamic Cost (RDN)',
          backgroundColor: '#1a237e', // Deep indigo/navy
          borderColor: '#000051',
          borderWidth: 1
        }
      ]
    };
  });

  readonly totals = computed(() => {
    const data = this.breakdown();
    const t = data.reduce((acc, curr) => ({
      totalKwh: acc.totalKwh + curr.totalKwh,
      totalCostFixed: acc.totalCostFixed + curr.totalCostFixed,
      totalCostDynamic: acc.totalCostDynamic + curr.totalCostDynamic,
      totalSavings: acc.totalSavings + curr.totalSavings,
    }), { totalKwh: 0, totalCostFixed: 0, totalCostDynamic: 0, totalSavings: 0 });

    return {
      ...t,
      totalSavingsPercentage: t.totalCostFixed > 0 ? (t.totalSavings / t.totalCostFixed) * 100 : 0
    };
  });

  readonly chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cost (PLN)'
        }
      }
    }
  };
}
