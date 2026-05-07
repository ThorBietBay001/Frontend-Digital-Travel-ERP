// --- AUTO GENERATED FROM OPENAPI ---

export interface ApiResponseHanhDongXanhResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: HanhDongXanhResponse;
  error?: string;
}

export interface HanhDongXanhRequest {
  tenHanhDong: string;
  diemCong: number;
  trangThai?: string;
}

export interface ApiResponseVoid {
  status?: number;
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface ApiResponseListHanhDongXanhResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: HanhDongXanhResponse[];
  error?: string;
}

export interface HanhDongXanhResponse {
  maHanhDongXanh?: string;
  tenHanhDong?: string;
  diemCong?: number;
  trangThai?: string;
}

// --- END AUTO GENERATED ---
export interface GreenAction {
  id: string;
  code: string;
  name: string;
  description: string;
  defaultPoints: number;
  status: 'active' | 'inactive';
}

export const mockGreenActions: GreenAction[] = [
  {
    id: '1',
    code: 'HD001',
    name: 'Nhặt rác bãi biển',
    description: 'HDV xác nhận khi khách thu gom rác',
    defaultPoints: 50,
    status: 'active',
  },
  {
    id: '2',
    code: 'HD002',
    name: 'Sử dụng bình nước cá nhân',
    description: 'Khách mang theo bình tái sử dụng',
    defaultPoints: 10,
    status: 'active',
  },
  {
    id: '3',
    code: 'HD003',
    name: 'Trồng cây xanh',
    description: 'Tham gia hoạt động trồng cây tại điểm đến',
    defaultPoints: 100,
    status: 'inactive',
  }
];
