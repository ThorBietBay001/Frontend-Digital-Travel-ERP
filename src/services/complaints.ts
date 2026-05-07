import api from '../services/api';
import type {
    XuLyHoTroRequest,
    ApiResponseYeuCauHoTroResponse,
    ApiResponsePageYeuCauHoTroResponse,
    YeuCauHoTroResponse,
    PageYeuCauHoTroResponse,
    PageableObject,
    SortObject
} from '../pages/complaints/mockData';

export type {
    XuLyHoTroRequest,
    YeuCauHoTroResponse,
    PageYeuCauHoTroResponse,
    ApiResponseYeuCauHoTroResponse,
    ApiResponsePageYeuCauHoTroResponse,
    PageableObject,
    SortObject,
};


export const complaintsService = {
    xuLyYeuCauHoTro: async (maYeuCau: string, data: XuLyHoTroRequest) => {
        const response = await api.put<ApiResponseYeuCauHoTroResponse>(`/api/kinh-doanh/yeu-cau-ho-tro/${maYeuCau}`, data);
        return response.data.data;
    },
    danhSachYeuCauHoTro: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageYeuCauHoTroResponse>('/api/kinh-doanh/yeu-cau-ho-tro', { params });
        return response.data.data;
    }
};
