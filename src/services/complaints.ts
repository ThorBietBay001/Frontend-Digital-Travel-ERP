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
    // UC39 - Giải quyết khiếu nại: Cập nhật kết quả xử lý
    xuLyYeuCauHoTro: async (maYeuCau: string, data: XuLyHoTroRequest) => {
        const response = await api.put<ApiResponseYeuCauHoTroResponse>(`/api/kinh-doanh/yeu-cau-ho-tro/${maYeuCau}`, data);
        return response.data.data;
    },
    // UC39 - Giải quyết khiếu nại: Yêu cầu HDV giải trình
    yeuCauHdvGiaiTrinh: async (maYeuCau: string, noiDung: string) => {
        const response = await api.post<ApiResponseYeuCauHoTroResponse>(
            `/api/kinh-doanh/yeu-cau-ho-tro/${maYeuCau}/yeu-cau-hdv-giai-trinh`,
            { noiDung }
        );
        return response.data.data;
    },
    // UC39 - Giải quyết khiếu nại: Yêu cầu khách bổ sung
    yeuCauKhachHangBoSung: async (maYeuCau: string, noiDung: string) => {
        const response = await api.post<ApiResponseYeuCauHoTroResponse>(
            `/api/kinh-doanh/yeu-cau-ho-tro/${maYeuCau}/yeu-cau-khach-hang-bo-sung`,
            { noiDung }
        );
        return response.data.data;
    },
    // UC39 - Giải quyết khiếu nại: Lọc yêu cầu hỗ trợ
    danhSachYeuCauHoTro: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponsePageYeuCauHoTroResponse>('/api/kinh-doanh/yeu-cau-ho-tro', { params });
        return response.data.data;
    }
};
