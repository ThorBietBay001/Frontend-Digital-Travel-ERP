export interface SettlementTour {
  id: string;
  code: string;
  name: string;
  endDate: string;
  startDate: string;
  totalRevenue: number;
  totalAllotmentCost: number;
  totalActualCost: number;
  passengerCount: number;
  guideName: string;
  guideCode: string;
  status: 'pending' | 'completed' | 'pending_info' | 'pending_over_budget';
  settlementNote?: string;
  receiptImage?: string;
  approverName?: string;
  actualCostItems: {
    category: string;
    amount: number;
    status: 'approved' | 'pending';
    warning?: string;
  }[];
  giaCamKet?: number;
}
