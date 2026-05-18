// --- AUTO GENERATED FROM OPENAPI ---

export interface ApiResponseTourThucTeResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: TourThucTeResponse;
  error?: string;
}

export interface CapNhatTourThucTeRequest {
  giaHienHanh?: number;
  soKhachToiDa?: number;
  soKhachToiThieu?: number;
  trangThai?: string;
}

export interface ApiResponseVoid {
  status?: number;
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface ApiResponsePageTourThucTeResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: PageTourThucTeResponse;
  error?: string;
}

export interface TaoTourThucTeRequest {
  maTourMau: string;
  ngayKhoiHanh: string;
  soKhachToiDa: number;
  soKhachToiThieu?: number;
  giaHienHanh: number;
}

export interface TourThucTeResponse {
  maTourThucTe?: string;
  maTourMau?: string;
  tieuDeTour?: string;
  ngayKhoiHanh?: string;
  ngayKetThuc?: string;
  giaHienHanh?: number;
  soKhachToiDa?: number;
  soKhachToiThieu?: number;
  choConLai?: number;
  trangThai?: string;
  thoiDiemTao?: string;
  capNhatVao?: string;
  taoBoi?: string;
}

export interface PageTourThucTeResponse {
  totalPages?: number;
  totalElements?: number;
  size?: number;
  content?: TourThucTeResponse[];
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

import type { DaySchedule } from '../tour-template/mockData';
export interface TourInstance {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  departureDate: string;
  vehicle: string;
  maxSeats: number;
  bookedSeats: number;
  currentPrice: number;
  basePrice: number;
  status: 'pending_activation' | 'active' | 'completed' | 'full' | 'cancelled';
  templateId: string;
  schedule: DaySchedule[];
}

export const mockTourInstances: TourInstance[] = [
  {
    id: '1',
    code: 'TM001-01',
    name: 'Khám phá Vịnh Hạ Long',
    startDate: '2025-05-20',
    endDate: '2025-05-22',
    departureDate: '2025-05-20',
    vehicle: 'Xe khách 29 chỗ',
    maxSeats: 20,
    bookedSeats: 15,
    currentPrice: 2500000,
    basePrice: 2000000,
    status: 'active',
    templateId: 'TM-HL-001',
    schedule: [
      {
        title: 'Ngày 1: Hà Nội - Hạ Long',
        description: 'Khởi hành từ Hà Nội, lên du thuyền ăn trưa, chiều thăm hang Sửng Sốt.',
        meals: { breakfast: 'Tự túc', lunch: 'Hải sản trên tàu', dinner: 'Buffet Á-Âu' },
      },
      {
        title: 'Ngày 2: Hạ Long - Hà Nội',
        description: 'Đón bình minh trên boong tàu, chèo thuyền kayak, trưa về bến và lên xe về HN.',
        meals: { breakfast: 'Xúp/Phở', lunch: 'Cơm set menu', dinner: 'Tự túc' },
      }
    ]
  },
  {
    id: '2',
    code: 'TM002-05',
    name: 'Hà Giang - Mùa Hoa Tam Giác Mạch',
    startDate: '2025-05-15',
    endDate: '2025-05-18',
    departureDate: '2025-05-15',
    vehicle: 'Xe giường nằm',
    maxSeats: 25,
    bookedSeats: 25,
    currentPrice: 3800000,
    basePrice: 3500000,
    status: 'full',
    templateId: 'TM-HG-002',
    schedule: [
      {
        title: 'Ngày 1: Hà Nội - Hà Giang',
        description: 'Khởi hành đêm từ Mỹ Đình lên thành phố Hà Giang.',
        meals: { breakfast: 'Tự túc', lunch: 'Tự túc', dinner: 'Cơm niêu' },
      }
    ]
  },
  {
    id: '3',
    code: 'TM003-02',
    name: 'Tour Ẩm thực Huế',
    startDate: '2025-05-10',
    endDate: '2025-05-12',
    departureDate: '2025-05-10',
    vehicle: 'Máy bay khứ hồi',
    maxSeats: 15,
    bookedSeats: 0,
    currentPrice: 1200000,
    basePrice: 1200000,
    status: 'cancelled',
    templateId: 'TM-HUE-003',
    schedule: [
      {
        title: 'Ngày 1: Foodtour đường phố',
        description: 'Thưởng thức các loại bánh Huế, bún bò, chè hẻm.',
        meals: { breakfast: 'Bún bò Huế', lunch: 'Bánh bèo nậm lọc', dinner: 'Cơm âm phủ' },
      }
    ]
  }
];
