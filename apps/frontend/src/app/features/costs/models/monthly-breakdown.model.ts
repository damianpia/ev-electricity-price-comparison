export interface MonthlyBreakdown {
  month: string; // YYYY-MM
  totalKwh: number;
  totalCostFixed: number;
  totalCostDynamic: number;
  totalSavings: number;
  savingsPercentage: number;
  minPrice: number;
}
