export interface CostItem {
  id: string;
  tourCode: string;
  tourName: string;
  guideName: string;
  category: string;
  amount: number;
  submittedDate: string;
  status: 'pending' | 'warning' | 'error' | 'approved' | 'rejected' | 'pending_info';
  warningType?: 'over_limit' | 'missing_docs' | null;
  warningMessage?: string;
  resolutionNote?: string;
  receiptImage?: string;
  guidePhone?: string;
  budgetLimit?: number;
}

export const mockCosts: CostItem[] = [
  {
    id: 'c-001',
    tourCode: 'TR-HAN-001',
    tourName: 'Hà Nội - Ninh Bình 3N2Đ',
    guideName: 'Lê Văn Nam',
    category: 'Chi phí vé tham quan',
    amount: 4500000,
    submittedDate: '02/10/2025',
    status: 'pending',
    guidePhone: '0903 123 456',
    budgetLimit: 5000000,
    receiptImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'c-002',
    tourCode: 'TR-DN-042',
    tourName: 'Đà Nẵng - Hội An 2N1Đ',
    guideName: 'Phạm Thị Hoa',
    category: 'Tiền ăn trưa đoàn 20 khách',
    amount: 8250000,
    submittedDate: '05/10/2025',
    status: 'warning',
    warningType: 'over_limit',
    warningMessage: 'Vượt định mức 15%',
    guidePhone: '0912 456 789',
    budgetLimit: 7200000,
    receiptImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'c-003',
    tourCode: 'TR-PQ-115',
    tourName: 'Phú Quốc 4N3Đ',
    guideName: 'Nguyễn Anh Tuấn',
    category: 'Chi phí thuê xe phát sinh',
    amount: 2000000,
    submittedDate: '07/10/2025',
    status: 'error',
    warningType: 'missing_docs',
    warningMessage: 'Thiếu chứng từ',
    guidePhone: '0933 888 222',
    budgetLimit: 2500000,
    receiptImage: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'c-004',
    tourCode: 'TR-HAN-002',
    tourName: 'Hà Nội - Hạ Long 2N1Đ',
    guideName: 'Trần Thị Bích',
    category: 'Mua nước suối cho đoàn',
    amount: 450000,
    submittedDate: '10/10/2025',
    status: 'pending',
    guidePhone: '0977 222 999',
    budgetLimit: 600000,
    receiptImage: 'https://images.unsplash.com/photo-1452251889946-8ff5ea7b27ab?auto=format&fit=crop&w=1200&q=80'
  }
];
