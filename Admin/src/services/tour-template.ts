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
    // UC06 - Tra cứu tour mẫu: Xem chi tiết tour mẫu
    chiTiet: async (id: string) => {
        const response = await api.get<ApiResponseTourMauChiTietResponse>(`/api/san-pham/tour-mau/${id}`);
        return response.data.data;
    },
    // UC04 - Sửa thông tin tour mẫu: Cập nhật tour mẫu
    capNhat: async (id: string, data: CapNhatTourMauRequest) => {
        const response = await api.put<ApiResponseTourMauResponse>(`/api/san-pham/tour-mau/${id}`, data);
        return response.data.data;
    },
    // UC05 - Xóa tour mẫu: Xóa tour mẫu
    xoa: async (id: string) => {
        const response = await api.delete<ApiResponseVoid>(`/api/san-pham/tour-mau/${id}`);
        return response.data.data;
    },
    // UC09 - Sửa lịch trình tour: Cập nhật lịch trình
    suaLichTrinh: async (id: string, maLichTrinh: string, data: LichTrinhRequest) => {
        const response = await api.put<ApiResponseLichTrinhResponse>(`/api/san-pham/tour-mau/${id}/lich-trinh/${maLichTrinh}`, data);
        return response.data.data;
    },
    // UC09 - Sửa lịch trình tour: Xóa lịch trình
    xoaLichTrinh: async (id: string, maLichTrinh: string) => {
        const response = await api.delete<ApiResponseVoid>(`/api/san-pham/tour-mau/${id}/lich-trinh/${maLichTrinh}`);
        return response.data.data;
    },
    // UC06 - Tra cứu tour mẫu: Lọc tour mẫu
    danhSach: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageTourMauResponse>('/api/san-pham/tour-mau', { params });
        return response.data.data;
    },
    // UC02 - Thêm mới tour mẫu: Tạo tour mẫu
    taoMoi: async (data: TaoTourMauRequest) => {
        const response = await api.post<ApiResponseTourMauChiTietResponse>('/api/san-pham/tour-mau', data);
        return response.data.data;
    },
    // UC03 - Sao chép tour mẫu: Tạo bản sao tour mẫu
    saoChep: async (id: string) => {
        const response = await api.post<ApiResponseTourMauChiTietResponse>(`/api/san-pham/tour-mau/${id}/sao-chep`, {});
        return response.data.data;
    },
    // UC08 - Thêm lịch trình tour: Thêm ngày lịch trình
    themLichTrinh: async (id: string, data: LichTrinhRequest) => {
        const response = await api.post<ApiResponseLichTrinhResponse>(`/api/san-pham/tour-mau/${id}/lich-trinh`, data);
        return response.data.data;
    }
};
