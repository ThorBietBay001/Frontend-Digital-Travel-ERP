// --- AUTO GENERATED FROM OPENAPI ---

export interface GanVaiTroRequest {
  maVaiTro: string;
}

export interface ApiResponseNhanVienResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: NhanVienResponse;
  error?: string;
}

export interface ApiResponseVoid {
  status?: number;
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface DangKyNhanVienRequest {
  tenDangNhap: string;
  matKhau: string;
  hoTen: string;
  email?: string;
  soDienThoai?: string;
  maVaiTro: string;
}

export interface ApiResponsePageNhanVienResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: PageNhanVienResponse;
  error?: string;
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

export interface PageNhanVienResponse {
  totalPages?: number;
  totalElements?: number;
  size?: number;
  content?: NhanVienResponse[];
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
export interface Account {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  role: string;
  status: 'active' | 'locked';
  avatar?: string;
}

export const allRoles = [
  'Quản trị viên',
  'Nhân viên sản phẩm',
  'Nhân viên kinh doanh',
  'Nhân viên điều hành',
  'Nhân viên kế toán',
  'Khách hàng',
];

export const permissionsMap: Record<string, string[]> = {
  'Quản trị viên': [
    'Quản lý tour mẫu',
    'Quản lý tour thực tế',
    'Quản lý đơn hàng',
    'Quản lý khách hàng',
    'Quản lý khiếu nại',
    'Quản lý khuyến mãi',
    'Điều phối HDV',
    'Tài chính kế toán',
    'Quản trị hệ thống',
  ],
  'Nhân viên sản phẩm': [
    'Quản lý tour mẫu',
    'Quản lý tour thực tế',
    'Dịch vụ bổ sung',
    'Hành động xanh',
  ],
  'Nhân viên kinh doanh': [
    'Quản lý đơn hàng',
    'Quản lý khách hàng',
    'Quản lý khuyến mãi',
  ],
  'Nhân viên điều hành': ['Điều phối HDV', 'Quản lý khiếu nại'],
  'Nhân viên kế toán': ['Tài chính kế toán'],
  'Khách hàng': [],
};

export const allPermissions = [
  'Quản lý tour mẫu',
  'Quản lý tour thực tế',
  'Quản lý đơn hàng',
  'Quản lý khách hàng',
  'Quản lý khiếu nại',
  'Quản lý khuyến mãi',
  'Điều phối HDV',
  'Tài chính kế toán',
  'Quản trị hệ thống',
];

export const initialAccounts: Account[] = [
  {
    id: '1',
    code: 'TK-001',
    name: 'Nguyễn Văn Admin',
    email: 'admin.nv@travelcorp.com',
    phone: '0901234567',
    username: 'admin',
    role: 'Quản trị viên',
    status: 'active',
  },
  {
    id: '2',
    code: 'TK-002',
    name: 'Trần Thị Kế Toán',
    email: 'ketoan.tt@travelcorp.com',
    phone: '0987654321',
    username: 'ketoan',
    role: 'Nhân viên kế toán',
    status: 'active',
  },
  {
    id: '3',
    code: 'TK-003',
    name: 'Lê Văn Điều Hành',
    email: 'dieuhanh.lv@travelcorp.com',
    phone: '0912345678',
    username: 'dieuhanh',
    role: 'Nhân viên điều hành',
    status: 'locked',
  },
  {
    id: '4',
    code: 'TK-004',
    name: 'Phạm Thị Sản Phẩm',
    email: 'sanpham.pt@travelcorp.com',
    phone: '0933334444',
    username: 'sanpham',
    role: 'Nhân viên sản phẩm',
    status: 'active',
  },
  {
    id: '5',
    code: 'TK-005',
    name: 'Khách Hàng A',
    email: 'khachhang.a@gmail.com',
    phone: '0955556666',
    username: 'khacha',
    role: 'Khách hàng',
    status: 'active',
  },
];
