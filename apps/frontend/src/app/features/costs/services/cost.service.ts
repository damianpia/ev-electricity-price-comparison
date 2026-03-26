import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { signalState, patchState } from '@ngrx/signals';
import { CostPeriod } from '../models/cost-period.model';
import { MonthlyBreakdown } from '../models/monthly-breakdown.model';
import { forkJoin, map } from 'rxjs';

interface CostState {
  costPeriods: CostPeriod[];
  monthlyBreakdown: MonthlyBreakdown[];
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CostService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/pricing';

  private readonly state = signalState<CostState>({
    costPeriods: [],
    monthlyBreakdown: [],
    isLoading: false,
    error: null,
  });

  readonly costPeriods = this.state.costPeriods;
  readonly monthlyBreakdown = this.state.monthlyBreakdown;
  readonly isLoading = this.state.isLoading;
  readonly error = this.state.error;

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
        patchState(this.state, { monthlyBreakdown: results });
      },
      error: (err) => {
        console.error('Fetch monthly breakdown error:', err);
      }
    });
  }

  fetchSummaries() {
    patchState(this.state, { isLoading: true, error: null });

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
        patchState(this.state, { costPeriods: results, isLoading: false });
      },
      error: (err) => {
        patchState(this.state, { error: 'Error fetching data from server.', isLoading: false });
        console.error('Fetch summaries error:', err);
      }
    });
  }
}
