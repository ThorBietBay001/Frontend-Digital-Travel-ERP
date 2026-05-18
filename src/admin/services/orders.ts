import api from '../services/api';
import type {
    ApiResponseDonDatTourResponse,
    ApiResponsePageDonDatTourResponse,
    DonDatTourResponse,
    PageDonDatTourResponse,
    ChiTietDatTourResponse,
    ChiTietDichVuResponse,
    PageableObject,
    SortObject
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


export const ordersService = {
    xacNhanDon: async (maDatTour: string) => {
        const response = await api.put<ApiResponseDonDatTourResponse>(`/api/kinh-doanh/dat-tour/${maDatTour}/xac-nhan`, {});
        return response.data.data;
    },
    danhSachTatCa: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageDonDatTourResponse>('/api/kinh-doanh/dat-tour', { params });
        return response.data.data;
    }
};
