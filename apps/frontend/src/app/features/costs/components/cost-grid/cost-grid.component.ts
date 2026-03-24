import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CostService } from '../../services/cost.service';

@Component({
  selector: 'app-cost-grid',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './cost-grid.component.html',
  styleUrl: './cost-grid.component.scss'
})
export class CostGridComponent {
  private readonly costService = inject(CostService);
  readonly costPeriods = this.costService.costPeriods;
}
