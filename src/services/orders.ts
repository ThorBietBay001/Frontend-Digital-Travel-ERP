import api from './api';
import { unwrapApiData, type PageQueryParams } from '../utils/apiHelpers';
import type {
  ApiResponseDonDatTourResponse,
  ApiResponsePageDonDatTourResponse,
  DonDatTourResponse,
  PageDonDatTourResponse,
  ChiTietDatTourResponse,
  ChiTietDichVuResponse,
  PageableObject,
  SortObject,
} from '../pages/orders/mockData';

export type {
  DonDatTourResponse,
  PageDonDatTourResponse,
  ChiTietDatTourResponse,
  ChiTietDichVuResponse,
  ApiResponseDonDatTourResponse,
  ApiResponsePageDonDatTourResponse,
  PageableObject,
  SortObject,
};

export interface DatTourListParams extends PageQueryParams {
  trangThai?: string;
  maTourThucTe?: string;
}

export const ordersService = {
  // UC34 - Tra cứu đơn hàng: Lọc đơn đặt tour
  danhSachTatCa: async (params?: DatTourListParams): Promise<PageDonDatTourResponse | undefined> => {
    const queryParams: Record<string, string | number> = {
      page: params?.page ?? 0,
      size: params?.size ?? 200,
      sort: params?.sort ?? 'khachHang,desc',
    };
    if (params?.trangThai) queryParams.trangThai = params.trangThai;
    if (params?.maTourThucTe) queryParams.maTourThucTe = params.maTourThucTe;

    const response = await api.get<ApiResponsePageDonDatTourResponse>('/api/kinh-doanh/dat-tour', {
      params: queryParams,
    });
    return unwrapApiData(response);
  },

  // UC34 - Tra cứu đơn hàng: Xem chi tiết đơn
  chiTietDatTour: async (maDatTour: string): Promise<DonDatTourResponse> => {
    const page = await ordersService.danhSachTatCa({ page: 0, size: 500 });
    const found = page?.content?.find((d) => d.maDatTour === maDatTour);
    if (!found) {
      throw new Error(`Không tìm thấy đơn đặt tour: ${maDatTour}`);
    }
    return found;
  },

  // UC29 - Thanh toán đơn hàng: Xác nhận giao dịch
  xacNhanDon: async (maDatTour: string): Promise<DonDatTourResponse | undefined> => {
    const response = await api.put<ApiResponseDonDatTourResponse>(
      `/api/kinh-doanh/dat-tour/${maDatTour}/xac-nhan`,
      {}
    );
    return unwrapApiData(response);
  },

  // UC29 - Thanh toán đơn hàng: Từ chối giao dịch
  tuChoiThanhToan: async (maDatTour: string): Promise<DonDatTourResponse | undefined> => {
    const response = await api.put<ApiResponseDonDatTourResponse>(
      `/api/kinh-doanh/dat-tour/${maDatTour}/tu-choi-thanh-toan`,
      {}
    );
    return unwrapApiData(response);
  },
};
