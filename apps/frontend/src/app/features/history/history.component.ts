import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyBreakdownComponent } from '../costs/components/monthly-breakdown/monthly-breakdown.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, MonthlyBreakdownComponent],
  template: `
    <section class="hero-section" data-testid="history-page">
      <h1>Charging History</h1>
      <p>Analyze your energy consumption and costs over months.</p>
    </section>
    
    <div class="mt-4">
      <app-monthly-breakdown></app-monthly-breakdown>
    </div>
  `
})
export class HistoryComponent {}
