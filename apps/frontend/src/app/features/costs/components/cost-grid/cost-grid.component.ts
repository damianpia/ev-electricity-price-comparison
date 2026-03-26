import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CostCardComponent } from '../cost-card/cost-card.component';
import { CostService } from '../../services/cost.service';

@Component({
  selector: 'app-cost-grid',
  standalone: true,
  imports: [CommonModule, CostCardComponent],
  templateUrl: './cost-grid.component.html',
  styleUrl: './cost-grid.component.scss'
})
export class CostGridComponent {
  private readonly costService = inject(CostService);
  readonly costPeriods = this.costService.costPeriods;
  readonly isLoading = this.costService.isLoading;
  readonly error = this.costService.error;
}
