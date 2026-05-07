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
  status: 'pending' | 'completed' | 'pending_over_budget';
  settlementNote?: string;
  actualCostItems: {
    category: string;
    amount: number;
    status: 'approved' | 'pending';
    warning?: string;
  }[];
}

export const mockSettlementTours: SettlementTour[] = [
  {
    id: 'st-001',
    code: 'DALAT-2310-01',
    name: 'Đà Lạt 3N2Đ',
    startDate: '20/10/2025',
    endDate: '22/10/2025',
    totalRevenue: 1250000000,
    totalAllotmentCost: 700000000,
    totalActualCost: 150000000,
    passengerCount: 28,
    guideName: 'Lê Văn Nam',
    guideCode: 'HDV-001',
    status: 'pending',
    actualCostItems: [
      { category: 'Vé tham quan', amount: 50000000, status: 'approved' },
      { category: 'Ăn uống', amount: 65000000, status: 'approved' },
      { category: 'Xe di chuyển', amount: 35000000, status: 'pending' }
    ]
  },
  {
    id: 'st-002',
    code: 'DANANG-2310-05',
    name: 'Đà Nẵng 2N1Đ',
    startDate: '10/10/2025',
    endDate: '11/10/2025',
    totalRevenue: 850000000,
    totalAllotmentCost: 500000000,
    totalActualCost: 420000000,
    passengerCount: 22,
    guideName: 'Phạm Thị Hoa',
    guideCode: 'HDV-006',
    status: 'pending',
    actualCostItems: [
      { category: 'Vé tham quan', amount: 140000000, status: 'approved' },
      { category: 'Ăn uống', amount: 160000000, status: 'pending', warning: 'Vượt định mức' },
      { category: 'Xe di chuyển', amount: 120000000, status: 'approved' }
    ]
  }
];
