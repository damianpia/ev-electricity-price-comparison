import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CostGridComponent } from '../costs/components/cost-grid/cost-grid.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CostGridComponent],
  template: `
    <section class="hero-section" data-testid="hero-section">
      <h1>Charging Cost Summary</h1>
      <p>Compare electricity costs for your EV across different time periods.</p>
    </section>
    <app-cost-grid></app-cost-grid>
  `
})
export class DashboardComponent {}
