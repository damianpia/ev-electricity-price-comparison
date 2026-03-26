import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CostGridComponent } from './cost-grid.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('CostGridComponent', () => {
  let component: CostGridComponent;
  let fixture: ComponentFixture<CostGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostGridComponent],
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
    const cards = compiled.querySelectorAll('app-cost-card');
    // Currently we have 3 hardcoded cards
    expect(cards.length).toBe(3);
    expect(cards[0].textContent).toContain('Last 90 days');
    expect(cards[1].textContent).toContain('Last 30 days');
    expect(cards[2].textContent).toContain('Last 7 days');
  });
});
