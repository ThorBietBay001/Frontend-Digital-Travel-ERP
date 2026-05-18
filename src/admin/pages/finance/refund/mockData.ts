export interface RefundRequest {
  id: string;
  code: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  reason: string;
  status: 'pending' | 'completed' | 'rejected';
  refundMethod?: 'gateway' | 'manual';
  bankAccount?: string;
  transactionCode?: string;
  attachments?: string[];
}

export const mockRefunds: RefundRequest[] = [
  {
    id: 'rf-001',
    code: 'RT-001',
    orderCode: 'BALI-8N7Đ',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0909 111 222',
    amount: 15000000,
    reason: 'Ốm đột xuất',
    status: 'pending',
    attachments: ['Giấy xác nhận y tế.pdf']
  },
  {
    id: 'rf-002',
    code: 'RT-002',
    orderCode: 'THAI-5N4D',
    customerName: 'Trần Thị B',
    customerPhone: '0918 333 777',
    amount: 8500000,
    reason: 'Thay đổi lịch trình',
    status: 'completed',
    refundMethod: 'gateway'
  },
  {
    id: 'rf-003',
    code: 'RT-003',
    orderCode: 'BK-88915',
    customerName: 'Trần Văn Hùng',
    customerPhone: '0932 444 555',
    amount: 3200000,
    reason: 'Không xin được visa',
    status: 'pending',
    attachments: ['Email từ đại sứ quán.pdf']
  },
  {
    id: 'rf-004',
    code: 'RT-004',
    orderCode: 'BK-88700',
    customerName: 'Phạm Thị Lan',
    customerPhone: '0966 555 111',
    amount: 0,
    reason: 'Hủy sát ngày (phạt 100%)',
    status: 'rejected'
  }
];
