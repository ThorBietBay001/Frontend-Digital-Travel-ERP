// --- AUTO GENERATED FROM OPENAPI ---

export interface ApiResponseTourMauChiTietResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: TourMauChiTietResponse;
  error?: string;
}

export interface CapNhatTourMauRequest {
  tieuDe?: string;
  moTa?: string;
  thoiLuong?: number;
  giaSan?: number;
  trangThai?: string;
}

export interface ApiResponseTourMauResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: TourMauResponse;
  error?: string;
}

export interface ApiResponseVoid {
  status?: number;
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface LichTrinhRequest {
  ngayThu: number;
  hoatDong: string;
  moTa?: string;
  thucDon?: string;
}

export interface ApiResponseLichTrinhResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: LichTrinhResponse;
  error?: string;
}

export interface ApiResponsePageTourMauResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: PageTourMauResponse;
  error?: string;
}

export interface TaoTourMauRequest {
  tieuDe: string;
  moTa?: string;
  thoiLuong: number;
  giaSan: number;
  lichTrinh?: LichTrinhRequest[];
}

export interface TourMauChiTietResponse {
  maTourMau?: string;
  tieuDe?: string;
  moTa?: string;
  thoiLuong?: number;
  giaSan?: number;
  danhGia?: number;
  soDanhGia?: number;
  trangThai?: string;
  thoiDiemTao?: string;
  capNhatVao?: string;
  taoBoi?: string;
  lichTrinh?: LichTrinhResponse[];
}

export interface TourMauResponse {
  maTourMau?: string;
  tieuDe?: string;
  moTa?: string;
  thoiLuong?: number;
  giaSan?: number;
  danhGia?: number;
  soDanhGia?: number;
  trangThai?: string;
  thoiDiemTao?: string;
  capNhatVao?: string;
  taoBoi?: string;
}

export interface LichTrinhResponse {
  maLichTrinhTour?: string;
  ngayThu?: number;
  hoatDong?: string;
  moTa?: string;
  thucDon?: string;
}

export interface PageTourMauResponse {
  totalPages?: number;
  totalElements?: number;
  size?: number;
  content?: TourMauResponse[];
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
export interface DaySchedule {
  title: string;
  description: string;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

export interface TourTemplate {
  id: string;
  code: string;
  title: string;
  description: string;
  duration: {
    days: number;
    nights: number;
  };
  basePrice: number;
  status: 'active' | 'inactive';
  tags: string;
  image: string;
  schedule: DaySchedule[];
}

export const mockTourTemplates: TourTemplate[] = [
  {
    id: '1',
    code: 'TM-ECO-001',
    title: 'Khám Phá Rừng Ngập Mặn Cần Giờ',
    description: 'Trải nghiệm hệ sinh thái rừng ngập mặn nguyên sinh, tìm hiểu đa dạng sinh học.',
    duration: { days: 2, nights: 1 },
    basePrice: 1850000,
    status: 'active',
    tags: 'Sinh thái, Cần Giờ',
    image: 'https://placehold.co/48x48/89D4FF/00668A?text=CG',
    schedule: [
      {
        title: 'Ngày 1: TP.HCM - Cần Giờ',
        description: 'Khởi hành đi Cần Giờ, tham quan Đảo Khỉ, đi ca nô xuyên rừng đước.',
        meals: { breakfast: 'Bánh mì/Phở', lunch: 'Hải sản địa phương', dinner: 'BBQ hải sản' }
      },
      {
        title: 'Ngày 2: Chợ Hàng Dương - TP.HCM',
        description: 'Tham quan mua sắm đặc sản mắm, hải sản khô tại Chợ Hàng Dương, di chuyển về lại TP.HCM.',
        meals: { breakfast: 'Bún/Hủ tiếu', lunch: 'Cơm phần', dinner: 'Tự túc' }
      }
    ]
  },
  {
    id: '2',
    code: 'TM-ECO-002',
    title: 'Mùa Vàng Mù Cang Chải Trekking',
    description: 'Hành trình trekking nhẹ nhàng qua những thửa ruộng bậc thang tuyệt đẹp mùa lúa chín.',
    duration: { days: 3, nights: 2 },
    basePrice: 3200000,
    status: 'active',
    tags: 'Trekking, Miền Núi',
    image: 'https://placehold.co/48x48/89D4FF/00668A?text=MCC',
    schedule: [
      {
        title: 'Ngày 1: Hà Nội - Nghĩa Lộ',
        description: 'Di chuyển từ Hà Nội lên Nghĩa Lộ, ngắm cảnh đèo núi hùng vĩ.',
        meals: { breakfast: 'Phở bò', lunch: 'Cơm bình dân', dinner: 'Đặc sản Tây Bắc' }
      },
      {
        title: 'Ngày 2: Nghĩa Lộ - Mù Cang Chải',
        description: 'Trekking qua các bản làng, chụp ảnh ruộng bậc thang.',
        meals: { breakfast: 'Bún chả', lunch: 'Cơm lam, Thịt nướng', dinner: 'Lẩu cá hồi' }
      },
      {
        title: 'Ngày 3: Tú Lệ - Hà Nội',
        description: 'Tham quan suối nước nóng Tú Lệ, mua cốm xanh trước khi về lại Hà Nội.',
        meals: { breakfast: 'Xôi nương', lunch: 'Cơm mâm', dinner: 'Tự túc' }
      }
    ]
  },
  {
    id: '3',
    code: 'TM-ECO-003',
    title: 'Côn Đảo - Bảo Tồn Rùa Biển',
    description: 'Tham gia chương trình tình nguyện bảo tồn rùa biển kết hợp du lịch tâm linh.',
    duration: { days: 4, nights: 3 },
    basePrice: 6500000,
    status: 'inactive',
    tags: 'Biển đảo, Bảo tồn',
    image: 'https://placehold.co/48x48/89D4FF/00668A?text=CD',
    schedule: [
      {
        title: 'Ngày 1: Sân bay Cỏ Ống - Thị trấn',
        description: 'Đón sân bay, nhận phòng, chiều lặn ngắm san hô.',
        meals: { breakfast: 'Tự túc', lunch: 'Cá biển', dinner: 'Hải sản' }
      },
      {
        title: 'Ngày 2: Hòn Bảy Cạnh',
        description: 'Sang hòn Bảy Cạnh xem rùa đẻ trứng (qua đêm).',
        meals: { breakfast: 'Bún riêu', lunch: 'Dã ngoại', dinner: 'Cơm dã chiến' }
      },
      {
        title: 'Ngày 3: Thả rùa con - Di tích lịch sử',
        description: 'Sáng sớm thả rùa con về biển. Trở lại đảo lớn tham quan nhà tù Côn Đảo.',
        meals: { breakfast: 'Mì gói', lunch: 'Cơm niêu', dinner: 'Nhà hàng địa phương' }
      },
      {
        title: 'Ngày 4: Chợ Côn Đảo - Sân bay',
        description: 'Tự do tham quan chợ Côn Đảo mua quà lưu niệm, ra sân bay.',
        meals: { breakfast: 'Cháo', lunch: 'Bánh canh', dinner: 'Tự túc' }
      }
    ]
  }
];
