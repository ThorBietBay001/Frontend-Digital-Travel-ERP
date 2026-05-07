// --- AUTO GENERATED FROM OPENAPI ---

export interface XuLyHoTroRequest {
  maNhanVienXuLy?: string;
  trangThai: string;
  ghiChu?: string;
}

export interface ApiResponseYeuCauHoTroResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: YeuCauHoTroResponse;
  error?: string;
}

export interface ApiResponsePageYeuCauHoTroResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: PageYeuCauHoTroResponse;
  error?: string;
}

export interface YeuCauHoTroResponse {
  maYeuCau?: string;
  maDatTour?: string;
  loaiYeuCau?: string;
  noiDung?: string;
  trangThai?: string;
  maNhanVienXuLy?: string;
  soTienHoan?: number;
  tiLeHoan?: number;
  thoiDiemTao?: string;
}

export interface PageYeuCauHoTroResponse {
  totalPages?: number;
  totalElements?: number;
  size?: number;
  content?: YeuCauHoTroResponse[];
  number?: number;
  numberOfElements?: number;
  pageable?: PageableObject;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface PageableObject {
  offset?: number;
  pageNumber?: number;
  pageSize?: number;
  paged?: boolean;
  sort?: SortObject;
  unpaged?: boolean;
}

export interface SortObject {
  empty?: boolean;
  sorted?: boolean;
  unsorted?: boolean;
}

// --- END AUTO GENERATED ---
export interface Complaint {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  tourName: string;
  guideName?: string;
  sentDate: string;
  severity: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'pending_info' | 'pending_guide' | 'resolved' | 'rejected' | 'cancelled';
  description: string;
  attachments?: string[];
  timeline: { action: string; timestamp: string }[];
  resolution?: string;
}

export const mockComplaints: Complaint[] = [
  {
    id: '1',
    code: 'KN-001',
    customerName: 'Trần Thị B',
    customerPhone: '0901234567',
    tourName: 'Sapa Eco Trekking',
    guideName: 'Lê Văn C',
    sentDate: '15/10/2024',
    severity: 'high',
    status: 'pending',
    description: 'Khách sạn tại Sapa không đúng như cam kết. Phòng không có view núi, máy sưởi hỏng. Hướng dẫn viên không hỗ trợ nhiệt tình khi tôi phản ánh.',
    timeline: [
      { action: 'Khách hàng tạo khiếu nại', timestamp: '15/10/2024 - 09:30 AM' },
      { action: 'Hệ thống tiếp nhận & Gán cho Tổng Đài', timestamp: '15/10/2024 - 09:35 AM' }
    ]
  },
  {
    id: '2',
    code: 'KN-002',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0987654321',
    tourName: 'Mekong Delta Cruise',
    guideName: 'Phạm Thị D',
    sentDate: '14/10/2024',
    severity: 'medium',
    status: 'processing',
    description: 'Bữa ăn trên tàu không đảm bảo vệ sinh. Tàu khởi hành trễ hơn 1 tiếng so với lịch trình.',
    timeline: [
      { action: 'Khách hàng tạo khiếu nại', timestamp: '14/10/2024 - 14:00 PM' },
      { action: 'Liên hệ HDV lấy thông tin', timestamp: '14/10/2024 - 15:30 PM' }
    ]
  },
  {
    id: '3',
    code: 'KN-003',
    customerName: 'Lê Văn C',
    customerPhone: '0912345678',
    tourName: 'Tour Phú Quốc',
    sentDate: '18/05/2024',
    severity: 'low',
    status: 'resolved',
    description: 'Xe đưa đón sân bay đến sai giờ, tôi phải tự gọi taxi.',
    resolution: 'Đã hoàn tiền taxi 200,000 VND và tặng voucher giảm giá 5% cho tour tiếp theo.',
    timeline: [
      { action: 'Khách hàng tạo khiếu nại', timestamp: '18/05/2024 - 10:00 AM' },
      { action: 'Xác minh lỗi do đối tác nhà xe', timestamp: '19/05/2024 - 09:00 AM' },
      { action: 'Thỏa thuận đền bù hoàn tiền taxi', timestamp: '19/05/2024 - 14:00 PM' },
      { action: 'Khách hàng đồng ý, đã chuyển khoản', timestamp: '20/05/2024 - 10:00 AM' }
    ]
  },
  {
    id: '4',
    code: 'KN-004',
    customerName: 'Hoàng Văn D',
    customerPhone: '0933445566',
    tourName: 'Đà Nẵng 3 ngày 2 đêm',
    guideName: 'Nguyễn Văn E',
    sentDate: '20/10/2024',
    severity: 'medium',
    status: 'pending_info',
    description: 'Phòng không giống quảng cáo trên web.',
    timeline: [
      { action: 'Khách hàng tạo khiếu nại', timestamp: '20/10/2024 - 14:00 PM' },
      { action: 'Yêu cầu khách hàng bổ sung thông tin', timestamp: '20/10/2024 - 15:00 PM' }
    ]
  },
  {
    id: '5',
    code: 'KN-005',
    customerName: 'Phạm Thị E',
    customerPhone: '0944556677',
    tourName: 'Nha Trang Hành Trình Biển',
    guideName: 'Trần Văn F',
    sentDate: '21/10/2024',
    severity: 'high',
    status: 'pending_guide',
    description: 'HDV không xuất hiện tại điểm hẹn.',
    timeline: [
      { action: 'Khách hàng tạo khiếu nại', timestamp: '21/10/2024 - 08:00 AM' },
      { action: 'Yêu cầu HDV giải trình', timestamp: '21/10/2024 - 08:30 AM' }
    ]
  }
];
