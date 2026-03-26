import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { CostGridComponent } from './features/costs/components/cost-grid/cost-grid.component';
import { CostService } from './features/costs/services/cost.service';
import { SidebarComponent } from './core/layout/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    MatToolbarModule, 
    MatIconModule, 
    MatProgressBarModule,
    MatSidenavModule,
    MatButtonModule,
    CostGridComponent,
    SidebarComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly costService = inject(CostService);
  protected readonly title = signal('EV Electricity Comparison');
  protected readonly isLoading = this.costService.isLoading;
  protected readonly error = this.costService.error;
  protected readonly isSidenavOpen = signal(true);

  toggleSidenav() {
    this.isSidenavOpen.update(open => !open);
  }
}
