import { TestBed } from '@angular/core/testing';
import { CostService } from './cost.service';
import { describe, it, expect, beforeEach } from 'vitest';

describe('CostService', () => {
  let service: CostService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CostService]
    });
    service = TestBed.inject(CostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial cost periods data', () => {
    const data = service.costPeriods();
    expect(data.length).toBe(3);
    expect(data.some(p => p.periodType === '24h')).toBe(true);
    expect(data.some(p => p.periodType === '7d')).toBe(true);
    expect(data.some(p => p.periodType === '30d')).toBe(true);
  });
});
