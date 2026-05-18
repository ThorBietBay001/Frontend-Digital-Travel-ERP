import api from '../services/api';
import type {
    ApiResponseTourMauChiTietResponse,
    CapNhatTourMauRequest,
    ApiResponseTourMauResponse,
    ApiResponseVoid,
    LichTrinhRequest,
    ApiResponseLichTrinhResponse,
    ApiResponsePageTourMauResponse,
    TaoTourMauRequest,
    TourMauChiTietResponse,
    TourMauResponse,
    LichTrinhResponse,
    PageTourMauResponse,
    PageableObject,
    SortObject
} from '../pages/tour-template/mockData';

// Re-export types for use in components
export type {
    TourMauResponse,
    TaoTourMauRequest,
    CapNhatTourMauRequest,
    TourMauChiTietResponse,
    LichTrinhRequest,
    LichTrinhResponse,
    PageTourMauResponse,
    PageableObject,
    SortObject,
    ApiResponseTourMauChiTietResponse,
    ApiResponseTourMauResponse,
    ApiResponseVoid,
    ApiResponseLichTrinhResponse,
    ApiResponsePageTourMauResponse
};

export const tourTemplateService = {
    chiTiet: async (id: string) => {
        const response = await api.get<ApiResponseTourMauChiTietResponse>(`/api/san-pham/tour-mau/${id}`);
        return response.data.data;
    },
    capNhat: async (id: string, data: CapNhatTourMauRequest) => {
        const response = await api.put<ApiResponseTourMauResponse>(`/api/san-pham/tour-mau/${id}`, data);
        return response.data.data;
    },
    xoa: async (id: string) => {
        const response = await api.delete<ApiResponseVoid>(`/api/san-pham/tour-mau/${id}`);
        return response.data.data;
    },
    suaLichTrinh: async (id: string, maLichTrinh: string, data: LichTrinhRequest) => {
        const response = await api.put<ApiResponseLichTrinhResponse>(`/api/san-pham/tour-mau/${id}/lich-trinh/${maLichTrinh}`, data);
        return response.data.data;
    },
    xoaLichTrinh: async (id: string, maLichTrinh: string) => {
        const response = await api.delete<ApiResponseVoid>(`/api/san-pham/tour-mau/${id}/lich-trinh/${maLichTrinh}`);
        return response.data.data;
    },
    danhSach: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageTourMauResponse>('/api/san-pham/tour-mau', { params });
        return response.data.data;
    },
    taoMoi: async (data: TaoTourMauRequest) => {
        const response = await api.post<ApiResponseTourMauChiTietResponse>('/api/san-pham/tour-mau', data);
        return response.data.data;
    },
    saoChep: async (id: string) => {
        const response = await api.post<ApiResponseTourMauChiTietResponse>(`/api/san-pham/tour-mau/${id}/sao-chep`, {});
        return response.data.data;
    },
    themLichTrinh: async (id: string, data: LichTrinhRequest) => {
        const response = await api.post<ApiResponseLichTrinhResponse>(`/api/san-pham/tour-mau/${id}/lich-trinh`, data);
        return response.data.data;
    }
};
