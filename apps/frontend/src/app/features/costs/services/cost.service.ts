import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CostPeriod } from '../models/cost-period.model';
import { forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CostService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/pricing'; // Assuming proxy or base URL configuration

  readonly costPeriods = signal<CostPeriod[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.fetchSummaries();
  }

  fetchSummaries() {
    this.isLoading.set(true);
    this.error.set(null);

    const periods: ('24h' | '7d' | '30d')[] = ['24h', '7d', '30d'];
    const labels = {
      '24h': 'Last 24h',
      '7d': 'Last 7 days',
      '30d': 'Last 30 days'
    };

    const requests = periods.map(period => 
      this.http.get<any>(`${this.apiUrl}/summary?period=${period}`).pipe(
        map(data => ({
          label: labels[period],
          periodType: period,
          totalCostFixed: data.totalCostFixed,
          totalCostDynamic: data.totalCostDynamic,
          energyConsumedKwh: data.totalKwh,
          averagePricePerKwh: data.totalKwh > 0 ? data.totalCostDynamic / data.totalKwh : 0,
          totalSavings: data.totalSavings
        } as CostPeriod))
      )
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        this.costPeriods.set(results);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Error fetching data from server.');
        this.isLoading.set(false);
        console.error('Fetch summaries error:', err);
      }
    });
  }
}
