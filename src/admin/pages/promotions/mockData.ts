// --- AUTO GENERATED FROM OPENAPI ---

export interface ApiResponseVoucherResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: VoucherResponse;
  error?: string;
}

export interface VoucherRequest {
  maCode: string;
  loaiUuDai: string;
  giaTriGiam: number;
  dieuKienApDung?: string;
  soLuotPhatHanh: number;
  ngayHieuLuc: string;
  ngayHetHan: string;
}

export interface ApiResponsePageVoucherResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: PageVoucherResponse;
  error?: string;
}

export interface PhatHanhVoucherRequest {
  maKhachHang: string;
}

export interface ApiResponseKhuyenMaiKhResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: KhuyenMaiKhResponse;
  error?: string;
}

export interface VoucherResponse {
  maVoucher?: string;
  maCode?: string;
  loaiUuDai?: string;
  giaTriGiam?: number;
  dieuKienApDung?: string;
  soLuotPhatHanh?: number;
  soLuotDaDung?: number;
  ngayHieuLuc?: string;
  ngayHetHan?: string;
  trangThai?: string;
  thoiDiemTao?: string;
  taoBoi?: string;
}

export interface PageVoucherResponse {
  totalPages?: number;
  totalElements?: number;
  size?: number;
  content?: VoucherResponse[];
  number?: number;
  numberOfElements?: number;
  pageable?: PageableObject;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface KhuyenMaiKhResponse {
  maVoucher?: string;
  maCode?: string;
  loaiUuDai?: string;
  giaTriGiam?: number;
  dieuKienApDung?: string;
  trangThai?: string;
  ngayHetHan?: string;
  ngayNhan?: string;
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
export interface Voucher {
  id: string;
  code: string;
  name: string;
  discountType: 'percent' | 'amount';
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  quantity: number;
  distributed: number;
  expiryDate: string;
  status: 'ready' | 'disabled';
  applicableTours?: string[];
  applicableTiers?: ('diamond' | 'gold' | 'silver' | 'bronze')[];
}

export interface CustomerTarget {
  id: string;
  name: string;
  email: string;
  tier: string;
  phone: string;
}

export const mockVouchers: Voucher[] = [
  {
    id: 'vc1',
    code: 'VC-SUMMER24',
    name: 'Ưu đãi Hè Rực Rỡ',
    discountType: 'percent',
    discountValue: 20,
    maxDiscount: 500000,
    quantity: 500,
    distributed: 150,
    expiryDate: '2024-08-31',
    status: 'ready',
  },
  {
    id: 'vc2',
    code: 'VC-ECO100',
    name: 'Hành Trình Xanh',
    discountType: 'amount',
    discountValue: 100000,
    quantity: 100,
    distributed: 80,
    expiryDate: '2024-07-15',
    status: 'ready',
  },
  {
    id: 'vc3',
    code: 'VC-WELCOME',
    name: 'Chào Mừng Thành Viên',
    discountType: 'percent',
    discountValue: 15,
    quantity: 1000,
    distributed: 1000,
    expiryDate: '2024-01-01',
    status: 'disabled',
  },
];

export const mockCustomerTargets: CustomerTarget[] = [
  { id: 'c1', name: 'Nguyễn Văn A', email: 'a.nguyen@email.com', tier: 'Diamond', phone: '0901234567' },
  { id: 'c2', name: 'Trần Thị B', email: 'b.tran@email.com', tier: 'Gold', phone: '0902345678' },
  { id: 'c3', name: 'Lê Văn C', email: 'c.le@email.com', tier: 'Silver', phone: '0903456789' },
  { id: 'c4', name: 'Phạm Thị D', email: 'd.pham@email.com', tier: 'Bronze', phone: '0904567890' },
  { id: 'c5', name: 'Hoàng Văn E', email: 'e.hoang@email.com', tier: 'Gold', phone: '0905678901' },
];