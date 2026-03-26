import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CostPeriod } from '../models/cost-period.model';
import { MonthlyBreakdown } from '../models/monthly-breakdown.model';
import { forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CostService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/pricing'; // Assuming proxy or base URL configuration

  readonly costPeriods = signal<CostPeriod[]>([]);
  readonly monthlyBreakdown = signal<MonthlyBreakdown[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.fetchSummaries();
    this.fetchMonthlyBreakdown();
  }

  fetchMonthlyBreakdown() {
    this.http.get<MonthlyBreakdown[]>(`${this.apiUrl}/monthly-breakdown`).pipe(
      map(results => results.map(item => {
        const savings = item.totalCostFixed - item.totalCostDynamic;
        return {
          ...item,
          totalSavings: savings,
          savingsPercentage: item.totalCostFixed > 0 ? (savings / item.totalCostFixed) * 100 : 0
        };
      })),
      takeUntilDestroyed()
    ).subscribe({
      next: (results) => {
        this.monthlyBreakdown.set(results);
      },
      error: (err) => {
        console.error('Fetch monthly breakdown error:', err);
      }
    });
  }

  fetchSummaries() {
    this.isLoading.set(true);
    this.error.set(null);

    const periods: string[] = ['365d', '90d', '30d', '7d'];

    const requests = periods.map(period => 
      this.http.get<any>(`${this.apiUrl}/summary?period=${period}`).pipe(
        map(data => {
          const daysMatch = period.match(/^(\d+)d$/);
          const daysCount = daysMatch ? parseInt(daysMatch[1], 10) : 30;
          
          return {
            daysCount,
            periodType: period,
            totalCostFixed: data.totalCostFixed,
            totalCostDynamic: data.totalCostDynamic,
            energyConsumedKwh: data.totalKwh,
            averagePricePerKwh: data.totalKwh > 0 ? data.totalCostDynamic / data.totalKwh : 0,
            totalSavings: data.totalSavings
          } as CostPeriod;
        })
      )
    );

    forkJoin(requests).pipe(
      takeUntilDestroyed()
    ).subscribe({
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
