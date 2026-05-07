// --- AUTO GENERATED FROM OPENAPI ---

export interface ApiResponseNangLucResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: NangLucResponse;
  error?: string;
}

export interface NangLucRequest {
  ngonNgu?: string;
  chungChi?: string;
  chuyenMon?: string;
}

export interface NangLucResponse {
  maNangLucNhanVien?: string;
  maNhanVien?: string;
  ngonNgu?: string;
  chungChi?: string;
  chuyenMon?: string;
  danhGia?: number;
  soDanhGia?: number;
  capNhatVao?: string;
}

// --- END AUTO GENERATED ---
export interface Competency {
  id: number;
  type: 'Ngôn ngữ' | 'Chứng chỉ' | 'Thế mạnh';
  name: string;
  note?: string;
}

export interface TourHistory {
  tourName: string;
  startDate: string;
  status: 'completed' | 'upcoming' | 'cancelled';
  amount: number;
  guideName?: string;
}

export interface Staff {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  birthday?: string;
  gender?: string;
  address?: string;
  joinDate?: string;
  greenPoints?: number;
  tourHistory?: TourHistory[];
  rating?: number;
}

export const roles = [
  { id: 'all', label: 'Tất cả vai trò' },
  { id: 'admin', label: 'Quản trị viên', color: 'bg-blue-100 text-blue-700' },
  { id: 'accountant', label: 'Nhân viên kế toán', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'operator', label: 'Nhân viên điều hành', color: 'bg-amber-100 text-amber-700' },
  { id: 'product', label: 'Nhân viên sản phẩm', color: 'bg-purple-100 text-purple-700' },
  { id: 'guide', label: 'Hướng dẫn viên', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'sales', label: 'Nhân viên kinh doanh', color: 'bg-lime-100 text-emerald-800' },
];

export const initialStaffList: Staff[] = [
  {
    id: '1',
    code: 'NV-001',
    name: 'Nguyễn Văn Admin',
    email: 'admin.nv@travelcorp.com',
    phone: '0901234567',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen%20Van%20Admin&background=E8F6FF&color=00668A',
    birthday: '1989-03-18',
    gender: 'Nam',
    address: '12 Nguyễn Du, Q.1, TP.HCM',
    joinDate: '2019-06-01',
    greenPoints: 820,
    rating: 4.8,
    tourHistory: [
      { tourName: 'Hạ Long Luxury', startDate: '2025-04-12', status: 'completed', amount: 12500000 },
      { tourName: 'Đà Nẵng Heritage', startDate: '2025-08-02', status: 'upcoming', amount: 9800000 },
    ],
  },
  {
    id: '2',
    code: 'NV-002',
    name: 'Trần Thị Kế Toán',
    email: 'ketoan.tt@travelcorp.com',
    phone: '0987654321',
    role: 'accountant',
    avatar: 'https://ui-avatars.com/api/?name=Tran%20Thi%20Ke%20Toan&background=E8F6FF&color=00668A',
    birthday: '1990-07-09',
    gender: 'Nữ',
    address: '32 Lý Thường Kiệt, Q.10, TP.HCM',
    joinDate: '2020-02-15',
    greenPoints: 540,
    rating: 4.5,
    tourHistory: [
      { tourName: 'Phú Quốc Chill', startDate: '2024-12-20', status: 'completed', amount: 8500000 },
      { tourName: 'Côn Đảo Retreat', startDate: '2025-09-05', status: 'upcoming', amount: 10200000 },
    ],
  },
  {
    id: '3',
    code: 'NV-003',
    name: 'Lê Văn Điều Hành',
    email: 'dieuhanh.lv@travelcorp.com',
    phone: '0912345678',
    role: 'operator',
    avatar: 'https://ui-avatars.com/api/?name=Le%20Van%20Dieu%20Hanh&background=E8F6FF&color=00668A',
    birthday: '1987-11-23',
    gender: 'Nam',
    address: '88 Cách Mạng Tháng 8, Q.3, TP.HCM',
    joinDate: '2018-10-10',
    greenPoints: 610,
    rating: 4.6,
    tourHistory: [
      { tourName: 'Sapa Eco Trekking', startDate: '2024-10-14', status: 'completed', amount: 9200000 },
      { tourName: 'Mekong Delta Cruise', startDate: '2025-01-12', status: 'completed', amount: 7600000 },
      { tourName: 'Nha Trang Summer', startDate: '2025-07-22', status: 'upcoming', amount: 6800000 },
    ],
  },
  {
    id: '4',
    code: 'NV-004',
    name: 'Phạm Thị Sản Phẩm',
    email: 'sanpham.pt@travelcorp.com',
    phone: '0933334444',
    role: 'product',
    avatar: 'https://ui-avatars.com/api/?name=Pham%20Thi%20San%20Pham&background=E8F6FF&color=00668A',
    birthday: '1992-04-05',
    gender: 'Nữ',
    address: '15 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',
    joinDate: '2021-03-20',
    greenPoints: 430,
    rating: 4.3,
    tourHistory: [
      { tourName: 'Đà Lạt Chill', startDate: '2024-11-02', status: 'completed', amount: 6400000 },
      { tourName: 'Huế Cố Đô', startDate: '2025-03-18', status: 'completed', amount: 7200000 },
    ],
  },
  {
    id: '5',
    code: 'NV-005',
    name: 'Nguyễn Văn HDV',
    email: 'hdv.nguyen@travelcorp.com',
    phone: '0977000111',
    role: 'guide',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen%20Van%20HDV&background=E8F6FF&color=00668A',
    birthday: '1993-09-12',
    gender: 'Nam',
    address: '220 Phạm Văn Đồng, TP.Thủ Đức',
    joinDate: '2022-06-12',
    greenPoints: 980,
    rating: 4.9,
    tourHistory: [
      { tourName: 'Sapa Eco Trekking', startDate: '2024-09-15', status: 'completed', amount: 8800000, guideName: 'Nguyễn Văn HDV' },
      { tourName: 'Tour Phú Quốc', startDate: '2025-05-10', status: 'upcoming', amount: 11000000, guideName: 'Nguyễn Văn HDV' },
      { tourName: 'Mekong Delta Cruise', startDate: '2025-02-11', status: 'completed', amount: 7600000, guideName: 'Nguyễn Văn HDV' },
    ],
  },
  {
    id: '6',
    code: 'NV-006',
    name: 'Hoàng Minh Quân',
    email: 'sales.quan@travelcorp.com',
    phone: '0966111222',
    role: 'sales',
    avatar: 'https://ui-avatars.com/api/?name=Hoang%20Minh%20Quan&background=E8F6FF&color=00668A',
    birthday: '1995-01-30',
    gender: 'Nam',
    address: '70 Võ Văn Tần, Q.3, TP.HCM',
    joinDate: '2023-01-08',
    greenPoints: 350,
    rating: 4.2,
    tourHistory: [
      { tourName: 'Phú Yên Xanh', startDate: '2024-08-18', status: 'completed', amount: 5400000 },
      { tourName: 'Quy Nhơn Seaside', startDate: '2025-06-24', status: 'upcoming', amount: 6900000 },
    ],
  },
  {
    id: '7',
    code: 'NV-007',
    name: 'Lê Thu Hà',
    email: 'guide.ha@travelcorp.com',
    phone: '0919888777',
    role: 'guide',
    avatar: 'https://ui-avatars.com/api/?name=Le%20Thu%20Ha&background=E8F6FF&color=00668A',
    birthday: '1994-06-27',
    gender: 'Nữ',
    address: '55 Trần Hưng Đạo, Q.5, TP.HCM',
    joinDate: '2022-11-01',
    greenPoints: 910,
    rating: 4.7,
    tourHistory: [
      { tourName: 'Huế Cố Đô', startDate: '2024-12-08', status: 'completed', amount: 7200000, guideName: 'Lê Thu Hà' },
      { tourName: 'Đà Nẵng Heritage', startDate: '2025-04-21', status: 'completed', amount: 9800000, guideName: 'Lê Thu Hà' },
      { tourName: 'Nha Trang Summer', startDate: '2025-08-10', status: 'upcoming', amount: 6800000, guideName: 'Lê Thu Hà' },
    ],
  },
];

export const mockStaff = initialStaffList;

export const initialCompetencies: Record<string, Competency[]> = {
  '1': [
    { id: 101, type: 'Chứng chỉ', name: 'Quản trị hệ thống', note: 'ISO 27001' },
    { id: 102, type: 'Thế mạnh', name: 'Quản lý rủi ro' },
    { id: 103, type: 'Ngôn ngữ', name: 'Tiếng Anh', note: 'IELTS 7.0' },
  ],
  '2': [
    { id: 201, type: 'Chứng chỉ', name: 'Kế toán trưởng', note: 'Cấp 2023' },
    { id: 202, type: 'Thế mạnh', name: 'Đối soát ngân sách' },
  ],
  '3': [
    { id: 301, type: 'Ngôn ngữ', name: 'Tiếng Anh', note: 'TOEIC 750' },
    { id: 302, type: 'Chứng chỉ', name: 'Điều hành tour quốc tế' },
    { id: 303, type: 'Thế mạnh', name: 'Xử lý khủng hoảng' },
  ],
  '4': [
    { id: 401, type: 'Ngôn ngữ', name: 'Tiếng Nhật', note: 'N3' },
    { id: 402, type: 'Chứng chỉ', name: 'Thiết kế tour trải nghiệm' },
  ],
  '5': [
    { id: 501, type: 'Ngôn ngữ', name: 'Tiếng Anh', note: 'Giao tiếp' },
    { id: 502, type: 'Ngôn ngữ', name: 'Tiếng Trung', note: 'HSK 4' },
    { id: 503, type: 'Chứng chỉ', name: 'Chứng chỉ HDV quốc tế' },
    { id: 504, type: 'Thế mạnh', name: 'Trekking' },
    { id: 505, type: 'Thế mạnh', name: 'Lặn biển' },
  ],
  '6': [
    { id: 601, type: 'Thế mạnh', name: 'Chăm sóc khách hàng doanh nghiệp' },
    { id: 602, type: 'Chứng chỉ', name: 'Kỹ năng bán hàng chuyên nghiệp' },
  ],
  '7': [
    { id: 701, type: 'Ngôn ngữ', name: 'Tiếng Hàn', note: 'TOPIK 3' },
    { id: 702, type: 'Chứng chỉ', name: 'Sơ cứu y tế cơ bản' },
    { id: 703, type: 'Thế mạnh', name: 'Dẫn đoàn miền Trung' },
  ],
};
