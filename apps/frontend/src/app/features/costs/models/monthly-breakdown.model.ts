export interface ChargingSessionDetail {
  id: string;
  startTime: string | Date;
  endTime: string | Date;
  kwhAdded: number;
  costFixed: number;
  costDynamic: number;
  optimalCost: number;
  optimalKwhPotential: number;
  optimalHours: number[];
}

export interface MonthlyBreakdown {
  month: string; // YYYY-MM
  totalKwh: number;
  totalCostFixed: number;
  totalCostDynamic: number;
  totalOptimalCost: number;
  totalSavings: number;
  savingsPercentage: number;
  minPrice: number;
  sessions: ChargingSessionDetail[];
}
