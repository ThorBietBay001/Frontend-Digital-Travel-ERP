// --- AUTO GENERATED FROM OPENAPI ---

export interface ApiResponseQuyetToanResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: QuyetToanResponse;
  error?: string;
}

export interface ApiResponseThanhToanResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: ThanhToanResponse;
  error?: string;
}

export interface ApiResponseChiPhiThucTeResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: ChiPhiThucTeResponse;
  error?: string;
}

export interface QuyetToanRequest {
  ghiChu?: string;
}

export interface ApiResponsePageQuyetToanResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: PageQuyetToanResponse;
  error?: string;
}

export interface ApiResponsePageThanhToanResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: PageThanhToanResponse;
  error?: string;
}

export interface ApiResponsePageChiPhiThucTeResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: PageChiPhiThucTeResponse;
  error?: string;
}

export interface QuyetToanResponse {
  maQuyetToan?: string;
  maTour?: string;
  tenTour?: string;
  tongDoanhThu?: number;
  tongChiPhi?: number;
  loiNhuan?: number;
  trangThai?: string;
  ghiChu?: string;
  ngayQuyetToan?: string;
  maNhanVien?: string;
  tenNhanVien?: string;
}

export interface ThanhToanResponse {
  maGiaoDich?: string;
  maDatTour?: string;
  trangThai?: string;
  phuongThuc?: string;
  soTien?: number;
  ngayThanhToan?: string;
  payUrl?: string;
  thongBao?: string;
}

export interface ChiPhiThucTeResponse {
  maChiPhi?: string;
  maTour?: string;
  maNhanVien?: string;
  tenNhanVien?: string;
  danhMuc?: string;
  thanhTien?: number;
  hoaDonAnh?: string;
  trangThaiDuyet?: string;
  ngayKhai?: string;
}

export interface PageQuyetToanResponse {
  totalPages?: number;
  totalElements?: number;
  size?: number;
  content?: QuyetToanResponse[];
  number?: number;
  numberOfElements?: number;
  pageable?: PageableObject;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface PageThanhToanResponse {
  totalPages?: number;
  totalElements?: number;
  size?: number;
  content?: ThanhToanResponse[];
  number?: number;
  numberOfElements?: number;
  pageable?: PageableObject;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface PageChiPhiThucTeResponse {
  totalPages?: number;
  totalElements?: number;
  size?: number;
  content?: ChiPhiThucTeResponse[];
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
