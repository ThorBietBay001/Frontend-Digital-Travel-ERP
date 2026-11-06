import api from './api';
import { unwrapApiData, type PageQueryParams } from '../utils/apiHelpers';
import type {
  ApiResponseTourThucTeResponse,
  CapNhatTourThucTeRequest,
  ApiResponseVoid,
  ApiResponsePageTourThucTeResponse,
  TaoTourThucTeRequest,
  TourThucTeResponse,
  PageTourThucTeResponse,
  PageableObject,
  SortObject,
} from '../pages/tour-instance/mockData';

export type {
  TourThucTeResponse,
  TaoTourThucTeRequest,
  CapNhatTourThucTeRequest,
  PageTourThucTeResponse,
  PageableObject,
  SortObject,
  ApiResponseTourThucTeResponse,
  ApiResponseVoid,
  ApiResponsePageTourThucTeResponse,
};

export interface TourThucTeListParams extends PageQueryParams {
  trangThai?: string;
  maTourMau?: string;
}

export const tourInstanceService = {
  // UC14 - Tra cứu tour thực tế: Lọc tour thực tế
  danhSach: async (params?: TourThucTeListParams): Promise<PageTourThucTeResponse | undefined> => {
    const response = await api.get<ApiResponsePageTourThucTeResponse>('/api/dieu-hanh/tour-thuc-te', {
      params: { page: 0, size: 200, ...params },
    });
    return unwrapApiData(response);
  },

  getAll: async (params?: TourThucTeListParams) => tourInstanceService.danhSach(params),

  // UC14 - Tra cứu tour thực tế: Xem chi tiết tour
  chiTiet: async (id: string): Promise<TourThucTeResponse | undefined> => {
    const response = await api.get<ApiResponseTourThucTeResponse>(`/api/dieu-hanh/tour-thuc-te/${id}`);
    return unwrapApiData(response);
  },

  // UC26 - Xem chi tiết tour: Xem tour công khai
  chiTietCongKhai: async (id: string): Promise<any | undefined> => {
    const response = await api.get<any>(`/api/public/tour/${id}`);
    return unwrapApiData(response);
  },

  // UC13 - Sửa tour thực tế: Cập nhật tour
  capNhat: async (id: string, data: CapNhatTourThucTeRequest): Promise<TourThucTeResponse | undefined> => {
    const response = await api.put<ApiResponseTourThucTeResponse>(`/api/dieu-hanh/tour-thuc-te/${id}`, data);
    return unwrapApiData(response);
  },

  // UC12 - Xóa tour thực tế: Hủy tour thực tế
  xoa: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponseVoid>(`/api/dieu-hanh/tour-thuc-te/${id}`);
    unwrapApiData(response);
  },

  // UC11 - Khởi tạo tour thực tế từ tour mẫu: Tạo chuyến tour
  taoMoi: async (data: TaoTourThucTeRequest): Promise<TourThucTeResponse | undefined> => {
    const response = await api.post<ApiResponseTourThucTeResponse>('/api/dieu-hanh/tour-thuc-te', data);
    return unwrapApiData(response);
  },

  danhSach_5: (params?: TourThucTeListParams) => tourInstanceService.danhSach(params),
};
