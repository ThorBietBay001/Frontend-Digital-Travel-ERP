import api from '../services/api';
import type {
    ApiResponsePageHoChieuSoResponse,
    ApiResponseHoChieuSoResponse,
    PageHoChieuSoResponse,
    HoChieuSoResponse,
    PageableObject,
    SortObject
} from '../pages/customers/mockData';

export type {
    HoChieuSoResponse,
    PageHoChieuSoResponse,
    ApiResponsePageHoChieuSoResponse,
    ApiResponseHoChieuSoResponse,
    PageableObject,
    SortObject,
};


export const customersService = {
    timKiemKhachHang: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageHoChieuSoResponse>('/api/kinh-doanh/khach-hang', { params });
        return response.data.data;
    },
    chiTietKhachHang: async (maKhachHang: string) => {
        const response = await api.get<ApiResponseHoChieuSoResponse>(`/api/kinh-doanh/khach-hang/${maKhachHang}`);
        return response.data.data;
    }
};
