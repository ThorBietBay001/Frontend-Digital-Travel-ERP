import api from '../services/api';
import type {
    ApiResponseTourThucTeResponse,
    CapNhatTourThucTeRequest,
    ApiResponseVoid,
    ApiResponsePageTourThucTeResponse,
    TaoTourThucTeRequest,
    TourThucTeResponse,
    PageTourThucTeResponse,
    PageableObject,
    SortObject
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


export const tourInstanceService = {
    chiTiet_3: async (id: string) => {
        const response = await api.get<ApiResponseTourThucTeResponse>(`/api/dieu-hanh/tour-thuc-te/${id}`);
        return response.data.data;
    },
    capNhat_4: async (id: string, data: CapNhatTourThucTeRequest) => {
        const response = await api.put<ApiResponseTourThucTeResponse>(`/api/dieu-hanh/tour-thuc-te/${id}`, data);
        return response.data.data;
    },
    xoa_4: async (id: string) => {
        const response = await api.delete<ApiResponseVoid>(`/api/dieu-hanh/tour-thuc-te/${id}`);
        return response.data.data;
    },
    danhSach_5: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageTourThucTeResponse>('/api/dieu-hanh/tour-thuc-te', { params });
        return response.data.data;
    },
    taoMoi_4: async (data: TaoTourThucTeRequest) => {
        const response = await api.post<ApiResponseTourThucTeResponse>('/api/dieu-hanh/tour-thuc-te', data);
        return response.data.data;
    }
};
