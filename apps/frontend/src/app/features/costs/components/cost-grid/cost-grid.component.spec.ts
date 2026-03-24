import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CostGridComponent } from './cost-grid.component';
import { CostService } from '../../services/cost.service';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CostGridComponent', () => {
  let component: CostGridComponent;
  let fixture: ComponentFixture<CostGridComponent>;
  let mockCostService: any;

  beforeEach(async () => {
    mockCostService = {
      costPeriods: signal([
        {
          label: 'Test 24h',
          periodType: '24h',
          totalCostFixed: 12,
          totalCostDynamic: 10,
          energyConsumedKwh: 10,
          averagePricePerKwh: 1,
          totalSavings: 2,
          trendPercentage: -5
        }
      ]),
      isLoading: signal(false),
      error: signal(null)
    };

    await TestBed.configureTestingModule({
      imports: [CostGridComponent],
      providers: [
        { provide: CostService, useValue: mockCostService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CostGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the cost cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('mat-card');
    expect(cards.length).toBe(1);
    expect(cards[0].textContent).toContain('Test 24h');
    // totalCostDynamic is 10
    expect(cards[0].textContent).toContain('10.00');
  });
});
