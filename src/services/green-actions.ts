import api from '../services/api';
import type {
    ApiResponseHanhDongXanhResponse,
    HanhDongXanhRequest,
    ApiResponseVoid,
    ApiResponseListHanhDongXanhResponse,
    HanhDongXanhResponse
} from '../pages/green-actions/mockData';

export type {
    HanhDongXanhResponse,
    HanhDongXanhRequest,
    ApiResponseHanhDongXanhResponse,
    ApiResponseVoid,
    ApiResponseListHanhDongXanhResponse,
};


export const greenActionsService = {
    // UC20 - Cấu hình hành động xanh: Xem chi tiết hành động
    chiTiet_1: async (id: string) => {
        const response = await api.get<ApiResponseHanhDongXanhResponse>(`/api/san-pham/hanh-dong-xanh/${id}`);
        return response.data.data;
    },
    // UC20 - Cấu hình hành động xanh: Cập nhật hành động
    capNhat_2: async (id: string, data: HanhDongXanhRequest) => {
        const response = await api.put<ApiResponseHanhDongXanhResponse>(`/api/san-pham/hanh-dong-xanh/${id}`, data);
        return response.data.data;
    },
    // UC20 - Cấu hình hành động xanh: Xóa hành động
    xoa_2: async (id: string) => {
        const response = await api.delete<ApiResponseVoid>(`/api/san-pham/hanh-dong-xanh/${id}`);
        return response.data.data;
    },
    // UC20 - Cấu hình hành động xanh: Lấy danh mục hành động
    danhSach_2: async () => {
        const response = await api.get<ApiResponseListHanhDongXanhResponse>('/api/san-pham/hanh-dong-xanh');
        return response.data.data;
    },
    // UC20 - Cấu hình hành động xanh: Tạo hành động xanh
    taoMoi_2: async (data: HanhDongXanhRequest) => {
        const response = await api.post<ApiResponseHanhDongXanhResponse>('/api/san-pham/hanh-dong-xanh', data);
        return response.data.data;
    }
};
