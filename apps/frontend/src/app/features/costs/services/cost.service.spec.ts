import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CostService } from './cost.service';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('CostService', () => {
  let service: CostService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CostService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    // Do not inject service here if it triggers HTTP requests in constructor
    // because we need to setup httpMock first.
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    service = TestBed.inject(CostService);
    // Flush initial constructor requests
    ['90d', '30d', '7d'].forEach(period => 
      httpMock.expectOne(`/api/pricing/summary?period=${period}`).flush({})
    );
    expect(service).toBeTruthy();
  });

  it('should fetch summaries and map to cost periods', () => {
    service = TestBed.inject(CostService);
    const mockResponse = {
      totalCostFixed: 100,
      totalCostDynamic: 80,
      totalKwh: 10,
      totalSavings: 20
    };

    // Trigger initial fetch from constructor
    const reqs = ['90d', '30d', '7d'].map(period => 
      httpMock.expectOne(`/api/pricing/summary?period=${period}`)
    );

    reqs.forEach(req => req.flush(mockResponse));

    const data = service.costPeriods();
    expect(data.length).toBe(3);
    expect(data[0].totalCostFixed).toBe(100);
    expect(data[0].totalSavings).toBe(20);
    expect(service.isLoading()).toBe(false);
  });

  it('should handle error during fetch', () => {
    service = TestBed.inject(CostService);
    const reqs = ['90d', '30d', '7d'].map(period => 
      httpMock.expectOne(`/api/pricing/summary?period=${period}`)
    );

    reqs[0].error(new ErrorEvent('Network error'));
    
    expect(service.error()).toBe('Error fetching data from server.');
    expect(service.isLoading()).toBe(false);
  });
});
