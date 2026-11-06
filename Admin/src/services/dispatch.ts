import api from './api';
import { unwrapApiData } from '../utils/apiHelpers';
import type {
  PhanCongHdvRequest,
  ApiResponsePhanCongResponse,
  ApiResponseListNhanVienResponse,
  ApiResponseVoid,
  PhanCongResponse,
  NhanVienResponse,
} from '../pages/dispatch/mockData';
import type { ApiResponsePageTourThucTeResponse, PageTourThucTeResponse } from '../pages/tour-instance/mockData';

export type {
  PhanCongHdvRequest,
  ApiResponsePhanCongResponse,
  ApiResponseListNhanVienResponse,
  ApiResponseVoid,
  PhanCongResponse,
  NhanVienResponse,
};

export interface HdvKhaDungParams {
  maTourThucTe: string;
}

export const dispatchService = {
  // UC37 - Điều phối HDV: Tạo phân công HDV
  phanCong: async (data: PhanCongHdvRequest): Promise<PhanCongResponse | undefined> => {
    const response = await api.post<ApiResponsePhanCongResponse>('/api/dieu-hanh/phan-cong', data);
    return unwrapApiData(response);
  },

  // UC37 - Điều phối HDV: Lấy tour cần phân công
  tourCanPhanCong: async (): Promise<PageTourThucTeResponse | undefined> => {
    const response = await api.get<ApiResponsePageTourThucTeResponse>('/api/dieu-hanh/tour-can-phan-cong', {
      params: { page: 0, size: 200 },
    });
    return unwrapApiData(response);
  },

  // UC38 - Tra cứu HDV: Lấy danh sách HDV khả dụng
  hdvKhaDung: async (params: HdvKhaDungParams): Promise<NhanVienResponse[]> => {
    const response = await api.get<ApiResponseListNhanVienResponse>('/api/dieu-hanh/hdv-kha-dung', {
      params,
    });
    return unwrapApiData(response) ?? [];
  },

  // UC37 - Điều phối HDV: Hủy phân công HDV
  huyPhanCong: async (maPhanCong: string): Promise<void> => {
    const response = await api.delete<ApiResponseVoid>(`/api/dieu-hanh/phan-cong/${maPhanCong}`);
    unwrapApiData(response);
  },

  // UC38 - Tra cứu HDV: Xem năng lực HDV
  nangLucHdv: async (maNhanVien: string): Promise<any> => {
    const response = await api.get<{ data: any }>(`/api/dieu-hanh/nhan-vien/${maNhanVien}/nang-luc`);
    return response.data.data;
  },

  // UC40 - Xem lịch trình và thông tin đoàn: Lấy tour của HDV
  tourCuaToi: async (): Promise<PhanCongResponse[]> => {
    const response = await api.get<{ data: PhanCongResponse[] }>('/api/huong-dan-vien/tour-cua-toi');
    return response.data.data ?? [];
  },

  // UC40 - Xem lịch trình và thông tin đoàn: Lấy lịch công tác
  lichCongTacNhanVien: async (maNhanVien: string): Promise<PhanCongResponse[]> => {
    const response = await api.get<{ data: PhanCongResponse[] }>(`/api/dieu-hanh/nhan-vien/${maNhanVien}/lich-cong-tac`);
    return response.data.data ?? [];
  },

  // UC37 - Điều phối HDV: Xác nhận phân công
  dongYPhanCong: async (maPhanCong: string): Promise<PhanCongResponse | undefined> => {
    const response = await api.post<ApiResponsePhanCongResponse>(`/api/huong-dan-vien/phan-cong/${maPhanCong}/dong-y`);
    return unwrapApiData(response);
  },

  // UC37 - Điều phối HDV: Từ chối phân công
  tuChoiPhanCong: async (maPhanCong: string): Promise<PhanCongResponse | undefined> => {
    const response = await api.post<ApiResponsePhanCongResponse>(`/api/huong-dan-vien/phan-cong/${maPhanCong}/tu-choi`);
    return unwrapApiData(response);
  },
};
