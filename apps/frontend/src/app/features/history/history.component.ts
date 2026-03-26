import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MonthlyBreakdownComponent } from '../costs/components/monthly-breakdown/monthly-breakdown.component';
import { CostService } from '../costs/services/cost.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, MonthlyBreakdownComponent, MatCardModule, MatIconModule],
  template: `
    <section class="hero-section" data-testid="history-page">
      <h1>Charging History</h1>
      <p>Analyze your energy consumption and costs over months.</p>
    </section>

    <div class="stats-grid mt-5 pt-4" *ngIf="!isLoading()">
      <mat-card class="stat-card">
        <mat-card-header>
          <div mat-card-avatar class="stat-icon-container daily">
            <mat-icon>bolt</mat-icon>
          </div>
          <mat-card-title>Avg. Daily Usage</mat-card-title>
          <mat-card-subtitle>All time</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="stat-value">
            {{ averageDailyKwh() | number:'1.1-2' }} <span class="unit">kWh/day</span>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-header>
          <div mat-card-avatar class="stat-icon-container median">
            <mat-icon>bar_chart</mat-icon>
          </div>
          <mat-card-title>Median Session</mat-card-title>
          <mat-card-subtitle>All time</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="stat-value">
            {{ medianSessionKwh() | number:'1.1-2' }} <span class="unit">kWh</span>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card">
        <mat-card-header>
          <div mat-card-avatar class="stat-icon-container total">
            <mat-icon>ev_station</mat-icon>
          </div>
          <mat-card-title>Total Energy</mat-card-title>
          <mat-card-subtitle>All time</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="stat-value">
            {{ totalEnergyKwh() | number:'1.0-0' }} <span class="unit">kWh</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    
    <div class="mt-4">
      <app-monthly-breakdown></app-monthly-breakdown>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      border-radius: 12px;
      transition: transform 0.2s ease;
      
      &:hover {
        transform: translateY(-4px);
      }
    }

    .stat-icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      width: 40px;
      height: 40px;
      
      mat-icon {
        color: white;
      }

      &.daily {
        background-color: #ff9800;
      }

      &.median {
        background-color: #3f51b5;
      }

      &.total {
        background-color: #4caf50;
      }
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 600;
      margin-top: 1rem;
      color: var(--mat-sys-on-surface);

      .unit {
        font-size: 1rem;
        font-weight: 400;
        color: var(--mat-sys-on-surface-variant);
        margin-left: 0.25rem;
      }
    }
  `]
})
export class HistoryComponent {
  private readonly costService = inject(CostService);

  readonly isLoading = this.costService.isLoading;

  readonly averageDailyKwh = computed(() => {
    const breakdown = this.costService.monthlyBreakdown();
    if (breakdown.length === 0) return 0;

    const totalKwh = breakdown.reduce((acc, item) => acc + item.totalKwh, 0);
    
    // Find the earliest session date
    let earliestDate: Date | null = null;
    for (const month of breakdown) {
      for (const session of month.sessions) {
        const sessionDate = new Date(session.startTime);
        if (!earliestDate || sessionDate < earliestDate) {
          earliestDate = sessionDate;
        }
      }
    }

    if (!earliestDate) return 0;

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - earliestDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    return totalKwh / diffDays;
  });

  readonly totalEnergyKwh = computed(() => {
    const breakdown = this.costService.monthlyBreakdown();
    return breakdown.reduce((acc, item) => acc + item.totalKwh, 0);
  });

  readonly medianSessionKwh = computed(() => {
    const breakdown = this.costService.monthlyBreakdown();
    const allSessions = breakdown.flatMap(m => m.sessions.map(s => s.kwhAdded));
    
    if (allSessions.length === 0) return 0;
    
    allSessions.sort((a, b) => a - b);
    const mid = Math.floor(allSessions.length / 2);
    
    return allSessions.length % 2 !== 0 
      ? allSessions[mid] 
      : (allSessions[mid - 1] + allSessions[mid]) / 2;
  });
}
