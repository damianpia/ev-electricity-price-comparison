export interface CostPeriod {
  label?: string; // Optional, can be used for custom periods
  daysCount: number;
  periodType: string;
  totalCostFixed: number;
  totalCostDynamic: number;
  energyConsumedKwh: number;
  averagePricePerKwh: number;
  totalSavings: number;
  trendPercentage?: number; // positive = increase, negative = decrease
}
