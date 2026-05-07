// --- AUTO GENERATED FROM OPENAPI ---

export interface PhanCongHdvRequest {
  maTourThucTe: string;
  maNhanVien: string;
  ghiChu?: string;
}

export interface ApiResponsePhanCongResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: PhanCongResponse;
  error?: string;
}

export interface ApiResponseListNhanVienResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: NhanVienResponse[];
  error?: string;
}

export interface ApiResponseVoid {
  status?: number;
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface PhanCongResponse {
  maPhanCong?: string;
  maTourThucTe?: string;
  tenTour?: string;
  maNhanVien?: string;
  tenNhanVien?: string;
  trangThai?: string;
  ngayPhanCong?: string;
}

export interface NhanVienResponse {
  maNhanVien?: string;
  maTaiKhoan?: string;
  tenDangNhap?: string;
  hoTen?: string;
  email?: string;
  soDienThoai?: string;
  maVaiTro?: string;
  trangThaiTaiKhoan?: string;
  trangThaiLamViec?: string;
  loaiNhanVien?: string;
  ngayVaoLam?: string;
  thoiDiemTao?: string;
}

// --- END AUTO GENERATED ---
export interface TourNeedGuide {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: string;
  passengers: number;
  requiredSkills: string[];
  status: 'pending' | 'assigned';
  location?: string;
  assignedGuide?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Guide {
  id: string;
  code: string;
  name: string;
  avatar?: string;
  languages: string[];
  skills: string[];
  rating: number;
  status: 'available' | 'busy' | 'resting';
  completedTours: number;
  matchPercent?: number;
  biography?: string;
  certificates?: string[];
  strengths?: string[];
  experience?: string;
  schedule?: { tour: string; start: string; end: string }[];
}

export const mockToursNeedGuide: TourNeedGuide[] = [
  {
    id: 't1',
    code: 'T-SAP05-24',
    name: 'Khám Phá Sapa - Bản Cát Cát',
    startDate: '15/05/2025',
    endDate: '18/05/2025',
    duration: '4 ngày 3 đêm',
    passengers: 20,
    requiredSkills: ['Tiếng Anh', 'Trekking', 'Sơ cứu'],
    status: 'pending',
    location: 'Sapa, Lào Cai'
  },
  {
    id: 't2',
    code: 'T-HAL06-24',
    name: 'Vịnh Hạ Long - Đảo Titốp',
    startDate: '20/05/2025',
    endDate: '22/05/2025',
    duration: '3 ngày 2 đêm',
    passengers: 15,
    requiredSkills: ['Tiếng Pháp', 'Lặn biển'],
    status: 'assigned',
    location: 'Hạ Long, Quảng Ninh',
    assignedGuide: { id: 'g4', name: 'Phạm Mai' }
  },
  {
    id: 't3',
    code: 'T-HOI07-24',
    name: 'Phố cổ Hội An - Ký ức thời gian',
    startDate: '20/11/2025',
    endDate: '22/11/2025',
    duration: '3 ngày 2 đêm',
    passengers: 12,
    requiredSkills: ['Văn hóa'],
    status: 'assigned',
    location: 'Hội An, Quảng Nam',
    assignedGuide: { id: 'g2', name: 'Trần Mai' }
  }
];

export const mockGuides: Guide[] = [
  {
    id: 'g1',
    code: 'HDV-001',
    name: 'Lê Văn Phát',
    languages: ['Tiếng Việt', 'Tiếng Anh C1'],
    skills: ['Sơ cứu', 'Trekking'],
    rating: 4.9,
    status: 'available',
    completedTours: 145,
    biography: 'Anh Lê Văn Phát là một HDV chuyên nghiệp với hơn 7 năm kinh nghiệm dẫn các tour mạo hiểm và trekking tại miền núi phía Bắc.',
    certificates: ['Thẻ HDV Quốc tế', 'Chứng nhận Sơ cấp cứu Chữ thập đỏ', 'Chứng chỉ leo núi mạo hiểm'],
    strengths: ['Xử lý tình huống khẩn cấp', 'Trekking năng nặng', 'Truyền lửa và gắn kết khách'],
    experience: '7 năm kinh nghiệm',
    schedule: []
  },
  {
    id: 'g2',
    code: 'HDV-002',
    name: 'Trần Mai',
    languages: ['Tiếng Việt', 'Tiếng Anh B2'],
    skills: ['Văn hóa', 'Ẩm thực'],
    rating: 4.7,
    status: 'available',
    completedTours: 89,
    biography: 'Chị Mai am hiểu sâu sắc về văn hóa miền Trung, đặc biệt là Huế và Hội An. Rất được lòng các vị khách lớn tuổi.',
    certificates: ['Thẻ HDV Nội địa', 'Khóa học Thuyết minh viên Di tích'],
    strengths: ['Kiến thức lịch sử sâu rộng', 'Chăm sóc khách hàng VIP'],
    experience: '4 năm kinh nghiệm',
    schedule: [{ tour: 'T-HOI07-24', start: '20/11/2025', end: '22/11/2025' }]
  },
  {
    id: 'g3',
    code: 'HDV-003',
    name: 'Nguyễn Nam',
    languages: ['Tiếng Việt', 'Tiếng Anh'],
    skills: ['Chụp ảnh'],
    rating: 4.5,
    status: 'resting',
    completedTours: 210,
    biography: 'Bạn Nam là HDV năng động, có thế mạnh về nhiếp ảnh chuyên nghiệp, phù hợp với các khách hàng gen Z thích lưu giữ khoảnh khắc.',
    certificates: ['Thẻ HDV Nội địa', 'Thợ chụp ảnh chuyên nghiệp'],
    strengths: ['Chụp ảnh nghệ thuật', 'Tạo dáng cho khách'],
    experience: '5 năm kinh nghiệm',
    schedule: []
  },
  {
    id: 'g4',
    code: 'HDV-004',
    name: 'Phạm Mai',
    languages: ['Tiếng Việt', 'Tiếng Trung'],
    skills: ['Sơ cứu', 'Lặn biển'],
    rating: 4.8,
    status: 'busy',
    completedTours: 176,
    biography: 'Chị Mai là chuyên gia dẫn các đoàn khách Trung Quốc, thành thạo tiếng Trung và có bằng lặn biển Scuba.',
    certificates: ['Thẻ HDV Quốc tế', 'PADI Open Water Diver', 'Chứng chỉ HSK 6'],
    strengths: ['Thuyết minh tiếng Trung xuất sắc', 'Hướng dẫn lặn cơ bản'],
    experience: '6 năm kinh nghiệm',
    schedule: [{ tour: 'T-HAL06-24', start: '20/05/2025', end: '22/05/2025' }]
  },
  {
    id: 'g5',
    code: 'HDV-005',
    name: 'Hoàng Anh',
    languages: ['Tiếng Việt', 'Tiếng Anh'],
    skills: ['Trekking'],
    rating: 4.6,
    status: 'available',
    completedTours: 54,
    biography: 'Hoàng Anh là HDV trẻ, đầy nhiệt huyết, thể lực tốt. Đã chinh phục fanxipan hơn 20 lần.',
    certificates: ['Thẻ HDV Nội địa'],
    strengths: ['Hoạt náo viên', 'Hỗ trợ khách yếu thể lực trên đường leo núi'],
    experience: '2 năm kinh nghiệm',
    schedule: []
  }
];