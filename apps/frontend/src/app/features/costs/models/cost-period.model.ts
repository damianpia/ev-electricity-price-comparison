export interface CostPeriod {
  label: string; // e.g., "Last 24h", "Last 7d", "Last 30d"
  periodType: '24h' | '7d' | '30d';
  totalCostFixed: number;
  totalCostDynamic: number;
  energyConsumedKwh: number;
  averagePricePerKwh: number;
  totalSavings: number;
  trendPercentage?: number; // positive = increase, negative = decrease
}
