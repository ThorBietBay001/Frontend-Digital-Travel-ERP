import api from './api';
import { unwrapApiData } from '../utils/apiHelpers';
import type {
  LoaiPhongRequest,
  ApiResponseLoaiPhongResponse,
  ApiResponseVoid,
  ApiResponseDichVuThemResponse,
  ApiResponseListLoaiPhongResponse,
  ApiResponseListDichVuThemResponse,
  LoaiPhongResponse,
  DichVuThemResponse,
} from '../pages/services/mockData';

export interface DichVuThemRequest {
  ten: string;
  donViTinh?: string;
  donGia: number;
  trangThai?: string;
}

export type {
  LoaiPhongRequest,
  LoaiPhongResponse,
  DichVuThemResponse,
  ApiResponseLoaiPhongResponse,
  ApiResponseVoid,
  ApiResponseDichVuThemResponse,
  ApiResponseListLoaiPhongResponse,
  ApiResponseListDichVuThemResponse,
};

export const servicesService = {
  danhSachLoaiPhong: async (): Promise<LoaiPhongResponse[]> => {
    const response = await api.get<ApiResponseListLoaiPhongResponse>('/api/san-pham/loai-phong');
    return unwrapApiData(response) ?? [];
  },

  taoLoaiPhong: async (data: LoaiPhongRequest): Promise<LoaiPhongResponse | undefined> => {
    const response = await api.post<ApiResponseLoaiPhongResponse>('/api/san-pham/loai-phong', data);
    return unwrapApiData(response);
  },

  capNhatLoaiPhong: async (id: string, data: LoaiPhongRequest): Promise<LoaiPhongResponse | undefined> => {
    const response = await api.put<ApiResponseLoaiPhongResponse>(`/api/san-pham/loai-phong/${id}`, data);
    return unwrapApiData(response);
  },

  xoaLoaiPhong: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponseVoid>(`/api/san-pham/loai-phong/${id}`);
    unwrapApiData(response);
  },

  danhSachDichVuThem: async (): Promise<DichVuThemResponse[]> => {
    const response = await api.get<ApiResponseListDichVuThemResponse>('/api/san-pham/dich-vu-them');
    return unwrapApiData(response) ?? [];
  },

  taoDichVuThem: async (data: DichVuThemRequest): Promise<DichVuThemResponse | undefined> => {
    const response = await api.post<ApiResponseDichVuThemResponse>('/api/san-pham/dich-vu-them', data);
    return unwrapApiData(response);
  },

  capNhatDichVuThem: async (id: string, data: DichVuThemRequest): Promise<DichVuThemResponse | undefined> => {
    const response = await api.put<ApiResponseDichVuThemResponse>(`/api/san-pham/dich-vu-them/${id}`, data);
    return unwrapApiData(response);
  },

  xoaDichVuThem: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponseVoid>(`/api/san-pham/dich-vu-them/${id}`);
    unwrapApiData(response);
  },

  /** @deprecated */
  danhSach_1: () => servicesService.danhSachLoaiPhong(),
  danhSach_3: () => servicesService.danhSachDichVuThem(),
  taoMoi_1: (data: LoaiPhongRequest) => servicesService.taoLoaiPhong(data),
  taoMoi_3: (data: DichVuThemRequest) => servicesService.taoDichVuThem(data),
  capNhat_1: (id: string, data: LoaiPhongRequest) => servicesService.capNhatLoaiPhong(id, data),
  capNhat_3: (id: string, data: DichVuThemRequest) => servicesService.capNhatDichVuThem(id, data),
  xoa_1: (id: string) => servicesService.xoaLoaiPhong(id),
  xoa_3: (id: string) => servicesService.xoaDichVuThem(id),
};
