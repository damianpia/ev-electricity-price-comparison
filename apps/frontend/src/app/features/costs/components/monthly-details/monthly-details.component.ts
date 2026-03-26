import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyBreakdown, ChargingSessionDetail } from '../../models/monthly-breakdown.model';

@Component({
  selector: 'app-monthly-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monthly-details.component.html',
  styleUrl: './monthly-details.component.scss'
})
export class MonthlyDetailsComponent {
  @Input({ required: true }) monthData!: MonthlyBreakdown;

  isNextDay(start: string | Date, end: string | Date): boolean {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return startDate.getDate() !== endDate.getDate() || startDate.getMonth() !== endDate.getMonth();
  }
}
