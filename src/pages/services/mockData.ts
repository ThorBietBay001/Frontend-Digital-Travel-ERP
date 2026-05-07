// --- AUTO GENERATED FROM OPENAPI ---

export interface LoaiPhongRequest {
  tenLoai: string;
  mucPhuThu?: number;
  trangThai?: string;
}

export interface ApiResponseLoaiPhongResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: LoaiPhongResponse;
  error?: string;
}

export interface ApiResponseVoid {
  status?: number;
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface DichVuThemRequest {
  ten: string;
  donViTinh?: string;
  donGia: number;
  trangThai?: string;
}

export interface ApiResponseDichVuThemResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: DichVuThemResponse;
  error?: string;
}

export interface ApiResponseListLoaiPhongResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: LoaiPhongResponse[];
  error?: string;
}

export interface ApiResponseListDichVuThemResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: DichVuThemResponse[];
  error?: string;
}

export interface LoaiPhongResponse {
  maLoaiPhong?: string;
  tenLoai?: string;
  mucPhuThu?: number;
  trangThai?: string;
}

export interface DichVuThemResponse {
  maDichVuThem?: string;
  ten?: string;
  donViTinh?: string;
  donGia?: number;
  trangThai?: string;
}

// --- END AUTO GENERATED ---
export interface Service {
  id: string;
  code: string;
  name: string;
  category: 'room' | 'extra';
  price: number;
  unit: string;
  status: 'active' | 'inactive';
}

export const mockServices: Service[] = [
  {
    id: '1',
    code: 'DV001',
    name: 'Phụ thu phòng đơn',
    category: 'room',
    price: 500000,
    unit: 'Phòng',
    status: 'active',
  },
  {
    id: '2',
    code: 'DV002',
    name: 'Xe đưa đón sân bay',
    category: 'extra',
    price: 300000,
    unit: 'Lượt',
    status: 'active',
  },
  {
    id: '3',
    code: 'DV003',
    name: 'Buffet tối cao cấp',
    category: 'extra',
    price: 450000,
    unit: 'Khách',
    status: 'inactive',
  }
];
