import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CostPeriod } from '../../models/cost-period.model';

@Component({
  selector: 'app-cost-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './cost-card.component.html',
  styleUrl: './cost-card.component.scss'
})
export class CostCardComponent {
  period = input.required<CostPeriod>();

  readonly dayPluralMapping = {
    '=1': 'Last 1 day',
    'other': 'Last # days'
  };
}
