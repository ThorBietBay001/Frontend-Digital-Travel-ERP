import api from '../services/api';
import type {
    LoaiPhongRequest,
    ApiResponseLoaiPhongResponse,
    ApiResponseVoid,
    DichVuThemRequest,
    ApiResponseDichVuThemResponse,
    ApiResponseListLoaiPhongResponse,
    ApiResponseListDichVuThemResponse,
    LoaiPhongResponse,
    DichVuThemResponse
} from '../pages/services/mockData';

export type {
    LoaiPhongRequest,
    LoaiPhongResponse,
    DichVuThemRequest,
    DichVuThemResponse,
    ApiResponseLoaiPhongResponse,
    ApiResponseVoid,
    ApiResponseDichVuThemResponse,
    ApiResponseListLoaiPhongResponse,
    ApiResponseListDichVuThemResponse,
};


export const servicesService = {
    capNhat_1: async (id: string, data: LoaiPhongRequest) => {
        const response = await api.put<ApiResponseLoaiPhongResponse>(`/api/san-pham/loai-phong/${id}`, data);
        return response.data.data;
    },
    xoa_1: async (id: string) => {
        const response = await api.delete<ApiResponseVoid>(`/api/san-pham/loai-phong/${id}`);
        return response.data.data;
    },
    capNhat_3: async (id: string, data: DichVuThemRequest) => {
        const response = await api.put<ApiResponseDichVuThemResponse>(`/api/san-pham/dich-vu-them/${id}`, data);
        return response.data.data;
    },
    xoa_3: async (id: string) => {
        const response = await api.delete<ApiResponseVoid>(`/api/san-pham/dich-vu-them/${id}`);
        return response.data.data;
    },
    danhSach_1: async () => {
        const response = await api.get<ApiResponseListLoaiPhongResponse>('/api/san-pham/loai-phong');
        return response.data.data;
    },
    taoMoi_1: async (data: LoaiPhongRequest) => {
        const response = await api.post<ApiResponseLoaiPhongResponse>('/api/san-pham/loai-phong', data);
        return response.data.data;
    },
    danhSach_3: async () => {
        const response = await api.get<ApiResponseListDichVuThemResponse>('/api/san-pham/dich-vu-them');
        return response.data.data;
    },
    taoMoi_3: async (data: DichVuThemRequest) => {
        const response = await api.post<ApiResponseDichVuThemResponse>('/api/san-pham/dich-vu-them', data);
        return response.data.data;
    }
};
