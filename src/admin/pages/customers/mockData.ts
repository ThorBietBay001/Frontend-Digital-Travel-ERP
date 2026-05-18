// --- AUTO GENERATED FROM OPENAPI ---

export interface ApiResponsePageHoChieuSoResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: PageHoChieuSoResponse;
  error?: string;
}

export interface ApiResponseHoChieuSoResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: HoChieuSoResponse;
  error?: string;
}

export interface PageHoChieuSoResponse {
  totalPages?: number;
  totalElements?: number;
  size?: number;
  content?: HoChieuSoResponse[];
  number?: number;
  numberOfElements?: number;
  pageable?: PageableObject;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface HoChieuSoResponse {
  maKhachHang?: string;
  maTaiKhoan?: string;
  tenDangNhap?: string;
  hoTen?: string;
  email?: string;
  soDienThoai?: string;
  diUng?: string;
  ghiChuYTe?: string;
  hangThanhVien?: string;
  diemXanh?: number;
  thoiDiemTao?: string;
  capNhatVao?: string;
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
export interface ComplaintHistory {
  id: string;
  code: string;
  date: string;
  description: string;
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
}

export interface TourHistory {
  tourCode: string;
  tourName: string;
  startDate: string;
  status: 'completed' | 'cancelled';
  amount: number;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  membershipTier: 'diamond' | 'gold' | 'silver' | 'bronze';
  greenPoints: number;
  status: 'active' | 'locked';
  avatar?: string;
  birthday?: string;
  address?: string;
  gender?: string;
  idCard?: string;
  tourHistory: TourHistory[];
  complaints?: ComplaintHistory[];
}

export const mockCustomers: Customer[] = [
  {
    id: '1',
    code: 'KH-001',
    name: 'Nguyễn Văn An',
    email: 'nguyendv@example.com',
    phone: '0901234567',
    membershipTier: 'gold',
    greenPoints: 2450,
    status: 'active',
    birthday: '15/08/1985',
    address: '123 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
    gender: 'Nam',
    idCard: '079085001234',
    tourHistory: [
      { tourCode: 'DH-001', tourName: 'Khám phá Vịnh Hạ Long', startDate: '20/05/2025', status: 'completed', amount: 5000000 },
      { tourCode: 'DH-005', tourName: 'Phú Quốc - Thiên Đường Biển Đảo', startDate: '10/01/2024', status: 'completed', amount: 8500000 }
    ],
    complaints: [
      { id: '1', code: 'KN-001', date: '01/06/2025', description: 'Chất lượng bữa ăn kém', status: 'resolved' }
    ]
  },
  {
    id: '2',
    code: 'KH-002',
    name: 'Trần Thị Kim',
    email: 'tranthikim@example.com',
    phone: '0987654321',
    membershipTier: 'diamond',
    greenPoints: 12500,
    status: 'active',
    birthday: '22/11/1990',
    address: 'Tòa nhà Landmark 81, Phường 22, Bình Thạnh, TP.HCM',
    gender: 'Nữ',
    idCard: '079190005678',
    tourHistory: [
      { tourCode: 'DH-002', tourName: 'Hà Giang - Mùa Hoa Tam Giác Mạch', startDate: '15/05/2025', status: 'completed', amount: 15200000 }
    ],
    complaints: [
      { id: '2', code: 'KN-002', date: '16/05/2025', description: 'Hướng dẫn viên đến trễ', status: 'processing' }
    ]
  },
  {
    id: '3',
    code: 'KH-003',
    name: 'Lê Văn Bình',
    email: 'levanbinh@example.com',
    phone: '0912345678',
    membershipTier: 'bronze',
    greenPoints: 0,
    status: 'locked',
    birthday: '05/03/1995',
    address: '45 Lê Lợi, Quận 1, TP.HCM',
    gender: 'Nam',
    idCard: '079195009012',
    tourHistory: [
      { tourCode: 'DH-003', tourName: 'Tour Ẩm thực Huế', startDate: '10/05/2025', status: 'cancelled', amount: 1200000 }
    ]
  }
];
